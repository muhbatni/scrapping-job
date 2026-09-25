import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus, ApplicationStatusHistory } from './application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(ApplicationStatusHistory) private historyRepo: Repository<ApplicationStatusHistory>,
  ) {}

  async create(userId: string, jobId: string, notes?: string): Promise<Application> {
    const existing = await this.appRepo.findOne({ where: { userId, jobId } });
    if (existing) throw new ConflictException('Lamaran sudah ada untuk lowongan ini');

    const app = this.appRepo.create({ userId, jobId, notes, status: ApplicationStatus.SAVED });
    const saved = await this.appRepo.save(app);

    await this.addHistory(saved.id, null, ApplicationStatus.SAVED, 'Lamaran dibuat');
    return saved;
  }

  async findAll(userId: string, status?: ApplicationStatus, page = 1, limit = 20) {
    const where: any = { userId };
    if (status) where.status = status;

    const [data, total] = await this.appRepo.findAndCount({
      where,
      relations: ['job', 'job.source'],
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string): Promise<Application> {
    const app = await this.appRepo.findOne({
      where: { id, userId },
      relations: ['job', 'job.source'],
    });
    if (!app) throw new NotFoundException('Lamaran tidak ditemukan');
    return app;
  }

  async updateStatus(
    id: string, userId: string, newStatus: ApplicationStatus, notes?: string,
  ): Promise<Application> {
    const app = await this.findOne(id, userId);
    const oldStatus = app.status;
    app.status = newStatus;
    app.notes = notes || app.notes;

    if (newStatus === ApplicationStatus.APPLIED && !app.appliedAt) {
      app.appliedAt = new Date();
    }

    const updated = await this.appRepo.save(app);
    await this.addHistory(id, oldStatus, newStatus, notes);
    return updated;
  }

  async getHistory(applicationId: string): Promise<ApplicationStatusHistory[]> {
    return this.historyRepo.find({
      where: { applicationId },
      order: { changedAt: 'DESC' },
    });
  }

  async getStats(userId: string) {
    const stats = await this.appRepo
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('app.userId = :userId', { userId })
      .groupBy('app.status')
      .getRawMany();

    const result: Record<string, number> = {};
    for (const s of stats) {
      result[s.status] = parseInt(s.count);
    }
    return result;
  }

  async getMonthlyStats(userId: string) {
    const stats = await this.appRepo
      .createQueryBuilder('app')
      .select("TO_CHAR(app.createdAt, 'YYYY-MM')", 'month')
      .addSelect('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('app.userId = :userId', { userId })
      .andWhere('app.created_at >= NOW() - INTERVAL \'12 months\'')
      .groupBy("TO_CHAR(app.created_at, 'YYYY-MM')")
      .addGroupBy('app.status')
      .orderBy("TO_CHAR(app.created_at, 'YYYY-MM')", 'ASC')
      .getRawMany();

    return stats;
  }

  async delete(id: string, userId: string): Promise<void> {
    const app = await this.findOne(id, userId);
    await this.appRepo.remove(app);
  }

  private async addHistory(
    applicationId: string,
    oldStatus: ApplicationStatus | null,
    newStatus: ApplicationStatus,
    notes?: string,
  ) {
    const history = this.historyRepo.create({
      applicationId,
      oldStatus,
      newStatus,
      notes,
    });
    await this.historyRepo.save(history);
  }
}
