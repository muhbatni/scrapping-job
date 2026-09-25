import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { JobSource } from '../job-sources/job-source.entity';

export enum CrawlStatus { PENDING = 'pending', RUNNING = 'running', COMPLETED = 'completed', FAILED = 'failed' }

@Entity('crawl_logs')
export class CrawlLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_id', nullable: true })
  sourceId: string;

  @Column({ type: 'enum', enum: CrawlStatus, default: CrawlStatus.PENDING })
  status: CrawlStatus;

  @Column({ name: 'jobs_found', default: 0 })
  jobsFound: number;

  @Column({ name: 'jobs_new', default: 0 })
  jobsNew: number;

  @Column({ name: 'jobs_updated', default: 0 })
  jobsUpdated: number;

  @Column({ name: 'jobs_skipped', default: 0 })
  jobsSkipped: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ name: 'duration_ms', nullable: true })
  durationMs: number;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => JobSource, { nullable: true })
  @JoinColumn({ name: 'source_id' })
  source: JobSource;
}
