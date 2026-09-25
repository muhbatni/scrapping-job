import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';

export enum ApplicationStatus {
  SAVED = 'saved',
  VIEWED = 'viewed',
  APPLIED = 'applied',
  INTERVIEW = 'interview',
  TECHNICAL_TEST = 'technical_test',
  HR_INTERVIEW = 'hr_interview',
  USER_INTERVIEW = 'user_interview',
  OFFERING = 'offering',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'job_id' })
  jobId: string;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.SAVED })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'applied_at', type: 'timestamptz', nullable: true })
  appliedAt: Date;

  @Column({ name: 'interview_date', type: 'timestamptz', nullable: true })
  interviewDate: Date;

  @Column({ name: 'cv_used', nullable: true })
  cvUsed: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;
}

@Entity('application_status_history')
export class ApplicationStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @Column({ name: 'old_status', type: 'enum', enum: ApplicationStatus, nullable: true })
  oldStatus: ApplicationStatus | null;

  @Column({ name: 'new_status', type: 'enum', enum: ApplicationStatus })
  newStatus: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'changed_at', type: 'timestamptz', default: () => 'NOW()' })
  changedAt: Date;
}
