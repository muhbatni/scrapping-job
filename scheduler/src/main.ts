import express from 'express';
import * as cron from 'node-cron';
import axios from 'axios';
import { Pool } from 'pg';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
  ),
  defaultMeta: { service: 'scheduler' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}] ${message}`;
        }),
      ),
    }),
  ],
});

const app = express();
app.use(express.json());

const CRAWLER_URL = process.env.CRAWLER_URL || 'http://crawler-service:3001';
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend-api:3000';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'jobassist',
  password: process.env.POSTGRES_PASSWORD || 'jobassist_secret_2024',
  database: process.env.POSTGRES_DB || 'jobassist_db',
});

// Track scheduled jobs
const scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

// Cron Jobs
// 1. Crawl all job boards every 6 hours
const crawlAllJob = cron.schedule('0 */6 * * *', async () => {
  logger.info('⏰ Scheduled crawl: All job boards');
  try {
    const response = await axios.post(`${CRAWLER_URL}/crawl/all`, {}, { timeout: 600000 });
    logger.info('Crawl all completed', { data: response.data });
  } catch (error: any) {
    logger.error('Scheduled crawl failed', { error: error.message });
  }
}, { scheduled: true });
scheduledJobs.set('crawl-all', crawlAllJob);

// 2. Crawl company career pages every 12 hours
const crawlCompaniesJob = cron.schedule('0 */12 * * *', async () => {
  logger.info('⏰ Scheduled crawl: Company career pages');
  try {
    const response = await axios.post(`${CRAWLER_URL}/crawl/companies`, {}, { timeout: 600000 });
    logger.info('Company crawl completed', { data: response.data });
  } catch (error: any) {
    logger.error('Company crawl failed', { error: error.message });
  }
}, { scheduled: true });
scheduledJobs.set('crawl-companies', crawlCompaniesJob);

// 3. Check for new matching jobs every hour (notification)
const notifyNewJobsJob = cron.schedule('0 * * * *', async () => {
  logger.info('⏰ Checking for new job matches');
  try {
    // Get keyword alerts
    const { rows: alerts } = await pool.query(
      'SELECT ka.*, u.id as user_id FROM keyword_alerts ka JOIN users u ON ka.user_id = u.id WHERE ka.is_active = true'
    );

    for (const alert of alerts) {
      const { rows: newJobs } = await pool.query(
        `SELECT id, title, company FROM jobs
         WHERE (title ILIKE $1 OR description ILIKE $1)
         AND created_at >= NOW() - INTERVAL '1 hour'
         AND is_active = true
         LIMIT 5`,
        [`%${alert.keyword}%`]
      );

      for (const job of newJobs) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, 'new_job', $2, $3, $4)`,
          [
            alert.user_id,
            `Lowongan baru: ${job.title}`,
            `${job.company} membuka posisi ${job.title}`,
            JSON.stringify({ jobId: job.id }),
          ]
        );
      }
    }

    // Check favorite companies
    const { rows: favorites } = await pool.query(
      `SELECT fc.*, u.id as user_id FROM favorite_companies fc JOIN users u ON fc.user_id = u.id`
    );

    for (const fav of favorites) {
      const { rows: newJobs } = await pool.query(
        `SELECT id, title, company FROM jobs
         WHERE company ILIKE $1
         AND created_at >= NOW() - INTERVAL '1 hour'
         AND is_active = true
         LIMIT 5`,
        [`%${fav.company_name}%`]
      );

      for (const job of newJobs) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, 'favorite_company', $2, $3, $4)`,
          [
            fav.user_id,
            `${fav.company_name} membuka lowongan baru`,
            `Posisi ${job.title} tersedia di ${job.company}`,
            JSON.stringify({ jobId: job.id }),
          ]
        );
      }
    }

    logger.info('Job match notifications sent');
  } catch (error: any) {
    logger.error('Notification check failed', { error: error.message });
  }
}, { scheduled: true });
scheduledJobs.set('notify-new-jobs', notifyNewJobsJob);

// 4. Clean up expired jobs daily at midnight
const cleanupJob = cron.schedule('0 0 * * *', async () => {
  logger.info('⏰ Cleaning up expired jobs');
  try {
    const result = await pool.query(
      `UPDATE jobs SET is_active = false
       WHERE expires_at IS NOT NULL AND expires_at < NOW() AND is_active = true`
    );
    logger.info(`Deactivated ${result.rowCount} expired jobs`);
  } catch (error: any) {
    logger.error('Cleanup failed', { error: error.message });
  }
}, { scheduled: true });
scheduledJobs.set('cleanup-expired', cleanupJob);

// API Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'scheduler' });
});

app.get('/jobs', (req, res) => {
  const jobs = Array.from(scheduledJobs.entries()).map(([name, task]) => ({
    name,
    running: true,
  }));
  res.json({ scheduledJobs: jobs });
});

app.post('/trigger/:jobName', async (req, res) => {
  const { jobName } = req.params;

  try {
    switch (jobName) {
      case 'crawl-all':
        const crawlResponse = await axios.post(`${CRAWLER_URL}/crawl/all`, {}, { timeout: 600000 });
        res.json({ success: true, result: crawlResponse.data });
        break;
      case 'crawl-companies':
        const companyResponse = await axios.post(`${CRAWLER_URL}/crawl/companies`, {}, { timeout: 600000 });
        res.json({ success: true, result: companyResponse.data });
        break;
      default:
        res.status(404).json({ error: 'Job not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const port = parseInt(process.env.SCHEDULER_PORT || '3002');
app.listen(port, () => {
  logger.info(`📅 Scheduler service running on port ${port}`);
  logger.info('Scheduled jobs:');
  logger.info('  - crawl-all: Every 6 hours');
  logger.info('  - crawl-companies: Every 12 hours');
  logger.info('  - notify-new-jobs: Every hour');
  logger.info('  - cleanup-expired: Daily at midnight');
});
