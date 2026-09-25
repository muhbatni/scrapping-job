import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrawlLog, CrawlStatus } from './crawl-log.entity';

@Injectable()
export class CrawlLogsService {
  constructor(
    @InjectRepository(CrawlLog) private logRepo: Repository<CrawlLog>,
  ) {}

  async findAll(page = 1, limit = 20, sourceId?: string) {
    const where: any = {};
    if (sourceId) where.sourceId = sourceId;

    const [data, total] = await this.logRepo.findAndCount({
      where,
      relations: ['source'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getRecentLogs(limit = 10): Promise<CrawlLog[]> {
    return this.logRepo.find({
      relations: ['source'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getErrorLogs(page = 1, limit = 20) {
    const [data, total] = await this.logRepo.findAndCount({
      where: { status: CrawlStatus.FAILED },
      relations: ['source'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getStats() {
    const stats = await this.logRepo
      .createQueryBuilder('log')
      .select('log.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(log.duration_ms)', 'avgDuration')
      .addSelect('SUM(log.jobs_found)', 'totalJobsFound')
      .addSelect('SUM(log.jobs_new)', 'totalJobsNew')
      .groupBy('log.status')
      .getRawMany();

    return stats;
  }

  async create(data: Partial<CrawlLog>): Promise<CrawlLog> {
    const log = this.logRepo.create(data);
    return this.logRepo.save(log);
  }

  async update(id: string, data: Partial<CrawlLog>): Promise<CrawlLog | null> {
    await this.logRepo.update(id, data);
    return this.logRepo.findOne({ where: { id } });
  }
}
