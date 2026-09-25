import { Page } from 'playwright';
import * as cheerio from 'cheerio';
import { CrawlerEngine, CrawledJob } from '../engine/crawler-engine';
import { logger } from '../utils/logger';

interface SourceConfig {
  id: string;
  name: string;
  base_url: string;
  crawl_config: any;
}

export class JobBoardCrawler {
  private engine: CrawlerEngine;
  private source: SourceConfig;

  constructor(engine: CrawlerEngine, source: SourceConfig) {
    this.engine = engine;
    this.source = source;
  }

  async crawl(): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const page = await this.engine.getPage();

    try {
      const sourceName = this.source.name.toLowerCase();

      if (sourceName.includes('jobstreet')) {
        return await this.crawlJobstreet(page);
      } else if (sourceName.includes('linkedin')) {
        return await this.crawlLinkedIn(page);
      } else if (sourceName.includes('glints')) {
        return await this.crawlGlints(page);
      } else if (sourceName.includes('indeed')) {
        return await this.crawlIndeed(page);
      } else if (sourceName.includes('kalibrr')) {
        return await this.crawlKalibrr(page);
      } else if (sourceName.includes('techinasia') || sourceName.includes('tech in asia')) {
        return await this.crawlTechInAsia(page);
      } else {
        return await this.crawlGeneric(page);
      }
    } catch (error: any) {
      logger.error(`Job board crawl error for ${this.source.name}`, { error: error.message });
      throw error;
    } finally {
      await page.close();
    }
  }

  private async crawlJobstreet(page: Page): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const url = `${this.source.base_url}/id/job-search/job-vacancy/1/`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.engine.getTimeout() });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      $('[data-automation="jobListing"] article, .sx2jih0 article, [data-testid="job-card"]').each((_, el) => {
        try {
          const title = $(el).find('[data-automation="jobTitle"], h3 a, .job-title').text().trim();
          const company = $(el).find('[data-automation="jobCompany"], .company-name, [data-automation="jobCardCompanyLink"]').text().trim();
          const location = $(el).find('[data-automation="jobCardLocation"], .location, [data-automation="jobLocation"]').text().trim();
          const link = $(el).find('a[data-automation="jobTitle"], h3 a').attr('href');

          if (title && company) {
            jobs.push({
              title,
              company,
              location: location || 'Indonesia',
              originalUrl: link ? (link.startsWith('http') ? link : `${this.source.base_url}${link}`) : undefined,
              externalId: link ? this.extractId(link) : undefined,
            });
          }
        } catch (e) {}
      });

      logger.info(`Jobstreet: Found ${jobs.length} jobs`);
    } catch (error: any) {
      logger.error('Jobstreet crawl error', { error: error.message });
    }

    return jobs;
  }

  private async crawlLinkedIn(page: Page): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const url = 'https://www.linkedin.com/jobs/search/?location=Indonesia&geoId=102478259';

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.engine.getTimeout() });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      $('.base-card, .job-search-card, [data-entity-urn]').each((_, el) => {
        try {
          const title = $(el).find('.base-search-card__title, .job-search-card__title').text().trim();
          const company = $(el).find('.base-search-card__subtitle, .job-search-card__company-name').text().trim();
          const location = $(el).find('.job-search-card__location').text().trim();
          const link = $(el).find('a.base-card__full-link, a.job-search-card__title-link').attr('href');

          if (title && company) {
            jobs.push({
              title,
              company,
              location: location || 'Indonesia',
              originalUrl: link,
              externalId: link ? this.extractId(link) : undefined,
            });
          }
        } catch (e) {}
      });

      logger.info(`LinkedIn: Found ${jobs.length} jobs`);
    } catch (error: any) {
      logger.error('LinkedIn crawl error', { error: error.message });
    }

    return jobs;
  }

  private async crawlGlints(page: Page): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const url = `${this.source.base_url}/id/opportunities/jobs/explore`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.engine.getTimeout() });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      $('[class*="JobCard"], [class*="job-card"], .compact-job-card').each((_, el) => {
        try {
          const title = $(el).find('[class*="JobTitle"], h3, [class*="job-title"]').text().trim();
          const company = $(el).find('[class*="CompanyName"], [class*="company-name"]').text().trim();
          const location = $(el).find('[class*="Location"], [class*="location"]').text().trim();
          const link = $(el).find('a').attr('href');

          if (title && company) {
            jobs.push({
              title,
              company,
              location: location || 'Indonesia',
              originalUrl: link ? (link.startsWith('http') ? link : `${this.source.base_url}${link}`) : undefined,
              externalId: link ? this.extractId(link) : undefined,
            });
          }
        } catch (e) {}
      });

      logger.info(`Glints: Found ${jobs.length} jobs`);
    } catch (error: any) {
      logger.error('Glints crawl error', { error: error.message });
    }

    return jobs;
  }

  private async crawlIndeed(page: Page): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const url = `${this.source.base_url}/jobs?l=Indonesia`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.engine.getTimeout() });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      $('.job_seen_beacon, .jobsearch-ResultsList .result, .tapItem').each((_, el) => {
        try {
          const title = $(el).find('.jobTitle span, h2.jobTitle a').text().trim();
          const company = $(el).find('.companyName, .company').text().trim();
          const location = $(el).find('.companyLocation, .location').text().trim();
          const link = $(el).find('a.jcs-JobTitle, h2.jobTitle a').attr('href');

          if (title && company) {
            jobs.push({
              title,
              company,
              location: location || 'Indonesia',
              originalUrl: link ? (link.startsWith('http') ? link : `https://id.indeed.com${link}`) : undefined,
              externalId: link ? this.extractId(link) : undefined,
            });
          }
        } catch (e) {}
      });

      logger.info(`Indeed: Found ${jobs.length} jobs`);
    } catch (error: any) {
      logger.error('Indeed crawl error', { error: error.message });
    }

    return jobs;
  }

  private async crawlKalibrr(page: Page): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const url = `${this.source.base_url}/id-ID/job-board/te/`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.engine.getTimeout() });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      $('[class*="JobCard"], .k-board-card, [data-testid="job-card"]').each((_, el) => {
        try {
          const title = $(el).find('h2, [class*="title"]').text().trim();
          const company = $(el).find('[class*="company"], [class*="Company"]').text().trim();
          const location = $(el).find('[class*="location"], [class*="Location"]').text().trim();
          const link = $(el).find('a').attr('href');

          if (title && company) {
            jobs.push({
              title,
              company,
              location: location || 'Indonesia',
              originalUrl: link ? (link.startsWith('http') ? link : `${this.source.base_url}${link}`) : undefined,
            });
          }
        } catch (e) {}
      });

      logger.info(`Kalibrr: Found ${jobs.length} jobs`);
    } catch (error: any) {
      logger.error('Kalibrr crawl error', { error: error.message });
    }

    return jobs;
  }

  private async crawlTechInAsia(page: Page): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const url = `${this.source.base_url}/search?country_name[]=Indonesia`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.engine.getTimeout() });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      $('[class*="job-card"], [class*="JobCard"], article').each((_, el) => {
        try {
          const title = $(el).find('h3, [class*="title"]').first().text().trim();
          const company = $(el).find('[class*="company"], [class*="Company"]').text().trim();
          const location = $(el).find('[class*="location"]').text().trim();
          const link = $(el).find('a').first().attr('href');

          if (title && company) {
            jobs.push({
              title,
              company,
              location: location || 'Indonesia',
              originalUrl: link ? (link.startsWith('http') ? link : `https://www.techinasia.com${link}`) : undefined,
            });
          }
        } catch (e) {}
      });

      logger.info(`Tech in Asia: Found ${jobs.length} jobs`);
    } catch (error: any) {
      logger.error('Tech in Asia crawl error', { error: error.message });
    }

    return jobs;
  }

  private async crawlGeneric(page: Page): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const config = this.source.crawl_config || {};

    try {
      const searchPath = config.searchPath || '';
      const url = `${this.source.base_url}${searchPath}`;

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.engine.getTimeout() });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      // Try common job listing selectors
      const selectors = [
        '[class*="job-card"]', '[class*="job-item"]', '[class*="job-listing"]',
        '[class*="vacancy"]', '[data-job]', '.job-list-item',
        'article', '.card',
      ];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          elements.each((_, el) => {
            try {
              const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
              const company = $(el).find('[class*="company"], [class*="employer"]').first().text().trim();
              const location = $(el).find('[class*="location"]').first().text().trim();
              const link = $(el).find('a').first().attr('href');

              if (title && title.length > 3) {
                jobs.push({
                  title,
                  company: company || this.source.name.replace(' Jobs', '').replace(' Careers', ''),
                  location: location || 'Indonesia',
                  originalUrl: link ? (link.startsWith('http') ? link : `${this.source.base_url}${link}`) : undefined,
                });
              }
            } catch (e) {}
          });

          if (jobs.length > 0) break;
        }
      }

      logger.info(`Generic (${this.source.name}): Found ${jobs.length} jobs`);
    } catch (error: any) {
      logger.error(`Generic crawl error for ${this.source.name}`, { error: error.message });
    }

    return jobs;
  }

  private extractId(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || url;
  }
}
