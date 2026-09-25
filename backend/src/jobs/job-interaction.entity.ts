import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('job_bookmarks')
export class JobBookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'job_id' })
  jobId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('job_views')
export class JobView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'job_id' })
  jobId: string;

  @Column({ name: 'viewed_at', type: 'timestamptz', default: () => 'NOW()' })
  viewedAt: Date;
}
