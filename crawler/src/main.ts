import express from 'express';
import { Pool } from 'pg';
import { CrawlerEngine } from './engine/crawler-engine';
import { logger } from './utils/logger';

const app = express();
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'jobassist',
  password: process.env.POSTGRES_PASSWORD || 'jobassist_secret_2024',
  database: process.env.POSTGRES_DB || 'jobassist_db',
});

const engine = new CrawlerEngine(pool);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'crawler' });
});

// Crawl all active sources
app.post('/crawl/all', async (req, res) => {
  try {
    logger.info('Starting crawl of all active sources');
    const results = await engine.crawlAllSources();
    res.json({ success: true, results });
  } catch (error: any) {
    logger.error('Crawl all failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crawl specific source
app.post('/crawl/source/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;
    logger.info(`Starting crawl for source: ${sourceId}`);
    const result = await engine.crawlSource(sourceId);
    res.json({ success: true, result });
  } catch (error: any) {
    logger.error('Crawl source failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crawl company career pages
app.post('/crawl/companies', async (req, res) => {
  try {
    logger.info('Starting crawl of company career pages');
    const results = await engine.crawlCompanyPages();
    res.json({ success: true, results });
  } catch (error: any) {
    logger.error('Company crawl failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get crawl status
app.get('/status', async (req, res) => {
  const status = engine.getStatus();
  res.json(status);
});

const port = parseInt(process.env.CRAWLER_PORT || '3001');
app.listen(port, () => {
  logger.info(`🕷️  Crawler service running on port ${port}`);
});
