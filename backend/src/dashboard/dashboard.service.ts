import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { JobBookmark } from '../jobs/job-interaction.entity';
import { Application, ApplicationStatus } from '../applications/application.entity';
import { CrawlLog } from '../crawl-logs/crawl-log.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(JobBookmark) private bookmarkRepo: Repository<JobBookmark>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(CrawlLog) private crawlRepo: Repository<CrawlLog>,
  ) {}

  async getUserDashboard(userId: string) {
    const totalJobs = await this.jobRepo.count({ where: { isActive: true } });
    const savedJobs = await this.bookmarkRepo.count({ where: { userId } });

    const applicationStats = await this.appRepo
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('app.userId = :userId', { userId })
      .groupBy('app.status')
      .getRawMany();

    const stats: Record<string, number> = {};
    let totalApplications = 0;
    for (const s of applicationStats) {
      stats[s.status] = parseInt(s.count);
      totalApplications += parseInt(s.count);
    }

    const monthlyStats = await this.appRepo
      .createQueryBuilder('app')
      .select("TO_CHAR(app.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('app.userId = :userId', { userId })
      .andWhere("app.created_at >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(app.created_at, 'YYYY-MM')")
      .orderBy("TO_CHAR(app.created_at, 'YYYY-MM')", 'ASC')
      .getRawMany();

    const recentJobs = await this.jobRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['source'],
    });

    return {
      totalJobs,
      savedJobs,
      totalApplications,
      totalInterview: (stats[ApplicationStatus.INTERVIEW] || 0)
        + (stats[ApplicationStatus.HR_INTERVIEW] || 0)
        + (stats[ApplicationStatus.USER_INTERVIEW] || 0)
        + (stats[ApplicationStatus.TECHNICAL_TEST] || 0),
      totalRejection: stats[ApplicationStatus.REJECTED] || 0,
      totalAccepted: stats[ApplicationStatus.ACCEPTED] || 0,
      totalOffering: stats[ApplicationStatus.OFFERING] || 0,
      applicationStats: stats,
      monthlyStats,
      recentJobs,
    };
  }

  async getAdminDashboard() {
    const totalJobs = await this.jobRepo.count();
    const activeJobs = await this.jobRepo.count({ where: { isActive: true } });
    const totalApplications = await this.appRepo.count();

    const recentCrawls = await this.crawlRepo.find({
      relations: ['source'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const crawlStats = await this.crawlRepo
      .createQueryBuilder('log')
      .select('log.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.status')
      .getRawMany();

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      recentCrawls,
      crawlStats,
    };
  }
}
