import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, Between, MoreThanOrEqual } from 'typeorm';
import { Job } from './job.entity';
import { JobBookmark, JobView } from './job-interaction.entity';
import { JobSearchDto } from './jobs.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(JobBookmark) private bookmarkRepo: Repository<JobBookmark>,
    @InjectRepository(JobView) private viewRepo: Repository<JobView>,
  ) {}

  async search(dto: JobSearchDto) {
    const qb = this.jobRepo.createQueryBuilder('job')
      .leftJoinAndSelect('job.source', 'source')
      .where('job.isActive = :active', { active: true });

    if (dto.keyword) {
      qb.andWhere('(job.title ILIKE :kw OR job.company ILIKE :kw OR job.description ILIKE :kw)', {
        kw: `%${dto.keyword}%`,
      });
    }

    if (dto.location) {
      qb.andWhere('job.location ILIKE :loc', { loc: `%${dto.location}%` });
    }

    if (dto.workType) {
      qb.andWhere('job.workType = :wt', { wt: dto.workType });
    }

    if (dto.jobType) {
      qb.andWhere('job.jobType = :jt', { jt: dto.jobType });
    }

    if (dto.experienceLevel) {
      qb.andWhere('job.experienceLevel = :el', { el: dto.experienceLevel });
    }

    if (dto.salaryMin) {
      qb.andWhere('job.salaryMax >= :smin', { smin: dto.salaryMin });
    }

    if (dto.sourceId) {
      qb.andWhere('job.sourceId = :sid', { sid: dto.sourceId });
    }

    // Sorting
    const sortMap: Record<string, string> = {
      posted_at: 'postedAt',
      postedAt: 'postedAt',
      created_at: 'createdAt',
      createdAt: 'createdAt',
      salary_max: 'salaryMax',
      salaryMax: 'salaryMax',
      title: 'title',
      company: 'company',
    };
    const sortField = sortMap[dto.sortBy || 'postedAt'] || 'postedAt';
    const sortOrder = dto.sortOrder || 'DESC';
    qb.orderBy(`job.${sortField}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['source'],
    });
    if (!job) throw new NotFoundException('Lowongan tidak ditemukan');
    return job;
  }

  async getTotal(): Promise<number> {
    return this.jobRepo.count({ where: { isActive: true } });
  }

  // Bookmarks
  async toggleBookmark(userId: string, jobId: string): Promise<{ bookmarked: boolean }> {
    const existing = await this.bookmarkRepo.findOne({ where: { userId, jobId } });
    if (existing) {
      await this.bookmarkRepo.remove(existing);
      return { bookmarked: false };
    }
    const bookmark = this.bookmarkRepo.create({ userId, jobId });
    await this.bookmarkRepo.save(bookmark);
    return { bookmarked: true };
  }

  async getBookmarks(userId: string, page = 1, limit = 20) {
    const [bookmarks, total] = await this.bookmarkRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const jobIds = bookmarks.map((b) => b.jobId);
    const jobs = jobIds.length > 0
      ? await this.jobRepo.find({ where: { id: In(jobIds) }, relations: ['source'] })
      : [];

    return {
      data: jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBookmarkCount(userId: string): Promise<number> {
    return this.bookmarkRepo.count({ where: { userId } });
  }

  async isBookmarked(userId: string, jobId: string): Promise<boolean> {
    const count = await this.bookmarkRepo.count({ where: { userId, jobId } });
    return count > 0;
  }

  // Views
  async markViewed(userId: string, jobId: string): Promise<void> {
    const existing = await this.viewRepo.findOne({ where: { userId, jobId } });
    if (!existing) {
      const view = this.viewRepo.create({ userId, jobId });
      await this.viewRepo.save(view);
    }
  }

  async isViewed(userId: string, jobId: string): Promise<boolean> {
    const count = await this.viewRepo.count({ where: { userId, jobId } });
    return count > 0;
  }

  // Bulk create (used by crawler)
  async upsertJob(data: Partial<Job>): Promise<Job> {
    if (data.contentHash) {
      const existing = await this.jobRepo.findOne({ where: { contentHash: data.contentHash } });
      if (existing) {
        Object.assign(existing, data);
        return this.jobRepo.save(existing);
      }
    }

    if (data.externalId && data.sourceId) {
      const existing = await this.jobRepo.findOne({
        where: { externalId: data.externalId, sourceId: data.sourceId },
      });
      if (existing) {
        Object.assign(existing, data);
        return this.jobRepo.save(existing);
      }
    }

    const job = this.jobRepo.create(data);
    return this.jobRepo.save(job);
  }
}
