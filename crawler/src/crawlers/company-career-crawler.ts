import { Page } from 'playwright';
import * as cheerio from 'cheerio';
import { CrawlerEngine, CrawledJob } from '../engine/crawler-engine';
import { logger } from '../utils/logger';

export class CompanyCareerCrawler {
  private engine: CrawlerEngine;
  private source: any;

  constructor(engine: CrawlerEngine, source: any) {
    this.engine = engine;
    this.source = source;
  }

  async crawl(): Promise<CrawledJob[]> {
    const page = await this.engine.getPage();

    try {
      return await this.crawlCareerPage(page);
    } catch (error: any) {
      logger.error(`Company career crawl error for ${this.source.name}`, { error: error.message });
      throw error;
    } finally {
      await page.close();
    }
  }

  private async crawlCareerPage(page: Page): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const companyName = this.source.name.replace(' Careers', '').replace(' Career', '');

    try {
      await page.goto(this.source.base_url, {
        waitUntil: 'domcontentloaded',
        timeout: this.engine.getTimeout(),
      });
      await page.waitForTimeout(3000);

      const html = await page.content();
      const $ = cheerio.load(html);

      // Try multiple selectors for career pages
      const jobSelectors = [
        '[class*="job"], [class*="position"], [class*="vacancy"], [class*="opening"]',
        '[class*="career-item"], [class*="job-item"], [class*="job-card"]',
        'li[class*="job"], li[class*="position"]',
        '.job-listing, .position-listing, .opening-listing',
        'article, .card',
      ];

      for (const selector of jobSelectors) {
        const elements = $(selector);
        if (elements.length > 2) {
          elements.each((_, el) => {
            try {
              const title = $(el).find('h2, h3, h4, [class*="title"], a').first().text().trim();
              const location = $(el).find('[class*="location"], [class*="city"]').first().text().trim();
              const department = $(el).find('[class*="department"], [class*="team"], [class*="category"]').first().text().trim();
              const link = $(el).find('a').first().attr('href');

              if (title && title.length > 3 && title.length < 200) {
                jobs.push({
                  title,
                  company: companyName,
                  location: location || 'Indonesia',
                  originalUrl: link ? (link.startsWith('http') ? link : `${this.source.base_url}${link}`) : this.source.base_url,
                  tags: department ? [department] : undefined,
                });
              }
            } catch (e) {}
          });

          if (jobs.length > 0) break;
        }
      }

      // If no jobs found with selectors, try to find links with job-related text
      if (jobs.length === 0) {
        $('a').each((_, el) => {
          const text = $(el).text().trim();
          const href = $(el).attr('href') || '';
          if (
            text.length > 5 && text.length < 200 &&
            (href.includes('/job') || href.includes('/career') || href.includes('/position') ||
             href.includes('/vacancy') || href.includes('/opening'))
          ) {
            jobs.push({
              title: text,
              company: companyName,
              location: 'Indonesia',
              originalUrl: href.startsWith('http') ? href : `${this.source.base_url}${href}`,
            });
          }
        });
      }

      logger.info(`Company career (${companyName}): Found ${jobs.length} jobs`);
    } catch (error: any) {
      logger.error(`Career page crawl error for ${companyName}`, { error: error.message });
    }

    return jobs;
  }
}
