import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobSource, JobSourceType } from './job-source.entity';

@Injectable()
export class JobSourcesService {
  constructor(
    @InjectRepository(JobSource) private sourceRepo: Repository<JobSource>,
  ) {}

  async findAll(type?: JobSourceType): Promise<JobSource[]> {
    const where: any = {};
    if (type) where.type = type;
    return this.sourceRepo.find({ where, order: { name: 'ASC' } });
  }

  async findActive(): Promise<JobSource[]> {
    return this.sourceRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<JobSource> {
    const source = await this.sourceRepo.findOne({ where: { id } });
    if (!source) throw new NotFoundException('Sumber lowongan tidak ditemukan');
    return source;
  }

  async create(data: Partial<JobSource>): Promise<JobSource> {
    const source = this.sourceRepo.create(data);
    return this.sourceRepo.save(source);
  }

  async update(id: string, data: Partial<JobSource>): Promise<JobSource> {
    const source = await this.findById(id);
    Object.assign(source, data);
    return this.sourceRepo.save(source);
  }

  async toggleActive(id: string): Promise<JobSource> {
    const source = await this.findById(id);
    source.isActive = !source.isActive;
    return this.sourceRepo.save(source);
  }

  async delete(id: string): Promise<void> {
    await this.sourceRepo.delete(id);
  }
}
