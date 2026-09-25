import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { JobSource } from '../job-sources/job-source.entity';

export enum WorkType { REMOTE = 'remote', HYBRID = 'hybrid', ONSITE = 'onsite' }
export enum JobType { FULL_TIME = 'full_time', PART_TIME = 'part_time', CONTRACT = 'contract', INTERNSHIP = 'internship', FREELANCE = 'freelance' }
export enum ExperienceLevel { ENTRY = 'entry', JUNIOR = 'junior', MID = 'mid', SENIOR = 'senior', LEAD = 'lead', MANAGER = 'manager', DIRECTOR = 'director', EXECUTIVE = 'executive' }

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_id', nullable: true })
  sourceId: string;

  @Column({ name: 'external_id', nullable: true })
  externalId: string;

  @Column({ length: 500 })
  title: string;

  @Column()
  company: string;

  @Column({ name: 'company_logo', nullable: true })
  companyLogo: string;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'work_type', type: 'enum', enum: WorkType, nullable: true })
  workType: WorkType;

  @Column({ name: 'job_type', type: 'enum', enum: JobType, nullable: true })
  jobType: JobType;

  @Column({ name: 'experience_level', type: 'enum', enum: ExperienceLevel, nullable: true })
  experienceLevel: ExperienceLevel;

  @Column({ name: 'salary_min', type: 'bigint', nullable: true })
  salaryMin: number;

  @Column({ name: 'salary_max', type: 'bigint', nullable: true })
  salaryMax: number;

  @Column({ name: 'salary_currency', default: 'IDR' })
  salaryCurrency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ name: 'original_url', nullable: true, length: 1000 })
  originalUrl: string;

  @Column({ name: 'posted_at', type: 'timestamptz', nullable: true })
  postedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'raw_data', type: 'jsonb', nullable: true })
  rawData: any;

  @Column({ name: 'content_hash', nullable: true })
  contentHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => JobSource, { nullable: true })
  @JoinColumn({ name: 'source_id' })
  source: JobSource;
}
