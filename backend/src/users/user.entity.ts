import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, OneToMany,
} from 'typeorm';
import { UserProfile } from '../profiles/user-profile.entity';
import { Application } from '../applications/application.entity';
import { Notification } from '../notifications/notification.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @OneToMany(() => Application, (app) => app.user)
  applications: Application[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];
}
