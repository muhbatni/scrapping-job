import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl: string;

  @Column({ name: 'github_url', nullable: true })
  githubUrl: string;

  @Column({ name: 'portfolio_url', nullable: true })
  portfolioUrl: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  province: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ name: 'cv_file_path', nullable: true })
  cvFilePath: string;

  @Column({ name: 'cover_letter_template', type: 'text', nullable: true })
  coverLetterTemplate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
