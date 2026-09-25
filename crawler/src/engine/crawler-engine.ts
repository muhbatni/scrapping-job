import { Pool } from 'pg';
import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import { logger } from '../utils/logger';
import { JobBoardCrawler } from '../crawlers/job-board-crawler';
import { CompanyCareerCrawler } from '../crawlers/company-career-crawler';

export interface CrawledJob {
  externalId?: string;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  workType?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  tags?: string[];
  originalUrl?: string;
  postedAt?: Date;
}

export interface CrawlResult {
  sourceId: string;
  sourceName: string;
  jobsFound: number;
  jobsNew: number;
  jobsUpdated: number;
  jobsSkipped: number;
  errors: string[];
  durationMs: number;
}

export class CrawlerEngine {
  private pool: Pool;
  private browser: Browser | null = null;
  private isRunning = false;
  private currentStatus: string = 'idle';
  private concurrency: number;
  private timeout: number;

  constructor(pool: Pool) {
    this.pool = pool;
    this.concurrency = parseInt(process.env.CRAWLER_CONCURRENCY || '3');
    this.timeout = parseInt(process.env.CRAWLER_TIMEOUT || '30000');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      status: this.currentStatus,
    };
  }

  async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    }
    return this.browser;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async crawlAllSources(): Promise<CrawlResult[]> {
    if (this.isRunning) {
      throw new Error('Crawler sedang berjalan');
    }

    this.isRunning = true;
    this.currentStatus = 'crawling all sources';
    const results: CrawlResult[] = [];

    try {
      const { rows: sources } = await this.pool.query(
        'SELECT * FROM job_sources WHERE is_active = true ORDER BY name'
      );

      for (const source of sources) {
        try {
          const result = await this.crawlSingleSource(source);
          results.push(result);
        } catch (error: any) {
          logger.error(`Failed to crawl ${source.name}`, { error: error.message });
          results.push({
            sourceId: source.id,
            sourceName: source.name,
            jobsFound: 0,
            jobsNew: 0,
            jobsUpdated: 0,
            jobsSkipped: 0,
            errors: [error.message],
            durationMs: 0,
          });
        }
      }
    } finally {
      await this.closeBrowser();
      this.isRunning = false;
      this.currentStatus = 'idle';
    }

    return results;
  }

  async crawlSource(sourceId: string): Promise<CrawlResult> {
    const { rows } = await this.pool.query('SELECT * FROM job_sources WHERE id = $1', [sourceId]);
    if (rows.length === 0) throw new Error('Source tidak ditemukan');

    try {
      return await this.crawlSingleSource(rows[0]);
    } finally {
      await this.closeBrowser();
    }
  }

  async crawlCompanyPages(): Promise<CrawlResult[]> {
    const { rows: sources } = await this.pool.query(
      "SELECT * FROM job_sources WHERE type = 'company_career' AND is_active = true"
    );

    const results: CrawlResult[] = [];
    for (const source of sources) {
      try {
        const result = await this.crawlSingleSource(source);
        results.push(result);
      } catch (error: any) {
        logger.error(`Failed to crawl company: ${source.name}`, { error: error.message });
      }
    }

    await this.closeBrowser();
    return results;
  }

  private async crawlSingleSource(source: any): Promise<CrawlResult> {
    const startTime = Date.now();
    const crawlLogId = await this.createCrawlLog(source.id);

    let result: CrawlResult = {
      sourceId: source.id,
      sourceName: source.name,
      jobsFound: 0,
      jobsNew: 0,
      jobsUpdated: 0,
      jobsSkipped: 0,
      errors: [],
      durationMs: 0,
    };

    try {
      await this.updateCrawlLog(crawlLogId, { status: 'running', started_at: new Date() });

      let jobs: CrawledJob[] = [];

      if (source.type === 'job_board') {
        const crawler = new JobBoardCrawler(this, source);
        jobs = await crawler.crawl();
      } else {
        const crawler = new CompanyCareerCrawler(this, source);
        jobs = await crawler.crawl();
      }

      result.jobsFound = jobs.length;

      // Save jobs to database
      for (const job of jobs) {
        try {
          const saved = await this.saveJob(source.id, job);
          if (saved === 'new') result.jobsNew++;
          else if (saved === 'updated') result.jobsUpdated++;
          else result.jobsSkipped++;
        } catch (error: any) {
          result.errors.push(`Failed to save job "${job.title}": ${error.message}`);
          result.jobsSkipped++;
        }
      }

      const durationMs = Date.now() - startTime;
      result.durationMs = durationMs;

      await this.updateCrawlLog(crawlLogId, {
        status: 'completed',
        completed_at: new Date(),
        duration_ms: durationMs,
        jobs_found: result.jobsFound,
        jobs_new: result.jobsNew,
        jobs_updated: result.jobsUpdated,
        jobs_skipped: result.jobsSkipped,
      });

      logger.info(`Crawl completed: ${source.name}`, {
        found: result.jobsFound,
        new: result.jobsNew,
        updated: result.jobsUpdated,
        duration: `${durationMs}ms`,
      });
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      result.durationMs = durationMs;
      result.errors.push(error.message);

      await this.updateCrawlLog(crawlLogId, {
        status: 'failed',
        completed_at: new Date(),
        duration_ms: durationMs,
        error_message: error.message,
      });

      logger.error(`Crawl failed: ${source.name}`, { error: error.message });
    }

    return result;
  }

  private async saveJob(sourceId: string, job: CrawledJob): Promise<'new' | 'updated' | 'skipped'> {
    const contentHash = this.generateHash(job);

    // Check for duplicates
    const { rows: existing } = await this.pool.query(
      'SELECT id, content_hash FROM jobs WHERE (content_hash = $1) OR (external_id = $2 AND source_id = $3)',
      [contentHash, job.externalId || '', sourceId]
    );

    if (existing.length > 0) {
      if (existing[0].content_hash === contentHash) {
        return 'skipped';
      }

      // Update existing job
      await this.pool.query(
        `UPDATE jobs SET
          title = $1, company = $2, location = $3, work_type = $4,
          job_type = $5, experience_level = $6, salary_min = $7, salary_max = $8,
          description = $9, requirements = $10, original_url = $11,
          content_hash = $12, updated_at = NOW()
        WHERE id = $13`,
        [
          job.title, job.company, job.location, job.workType,
          job.jobType, job.experienceLevel, job.salaryMin, job.salaryMax,
          job.description, job.requirements, job.originalUrl,
          contentHash, existing[0].id,
        ]
      );
      return 'updated';
    }

    // Insert new job
    await this.pool.query(
      `INSERT INTO jobs (
        source_id, external_id, title, company, company_logo, location,
        work_type, job_type, experience_level, salary_min, salary_max,
        salary_currency, description, requirements, benefits, tags,
        original_url, posted_at, content_hash
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [
        sourceId, job.externalId, job.title, job.company, job.companyLogo, job.location,
        job.workType, job.jobType, job.experienceLevel, job.salaryMin, job.salaryMax,
        job.salaryCurrency || 'IDR', job.description, job.requirements, job.benefits,
        job.tags ? `{${job.tags.join(',')}}` : null,
        job.originalUrl, job.postedAt, contentHash,
      ]
    );

    return 'new';
  }

  private generateHash(job: CrawledJob): string {
    const content = `${job.title}|${job.company}|${job.location}|${job.description}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async createCrawlLog(sourceId: string): Promise<string> {
    const { rows } = await this.pool.query(
      'INSERT INTO crawl_logs (source_id, status) VALUES ($1, $2) RETURNING id',
      [sourceId, 'pending']
    );
    return rows[0].id;
  }

  private async updateCrawlLog(id: string, data: any): Promise<void> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    await this.pool.query(`UPDATE crawl_logs SET ${sets} WHERE id = $1`, [id, ...values]);
  }

  // Public methods for crawlers
  async getPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });
    return context.newPage();
  }

  getTimeout(): number {
    return this.timeout;
  }
}
