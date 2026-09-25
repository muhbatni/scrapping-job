import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum JobSourceType { JOB_BOARD = 'job_board', COMPANY_CAREER = 'company_career' }

@Entity('job_sources')
export class JobSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: JobSourceType })
  type: JobSourceType;

  @Column({ name: 'base_url' })
  baseUrl: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'crawl_config', type: 'jsonb', default: {} })
  crawlConfig: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
