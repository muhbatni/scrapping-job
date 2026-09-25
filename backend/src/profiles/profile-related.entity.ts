import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ default: 1 })
  level: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('education')
export class Education {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  institution: string;

  @Column({ nullable: true })
  degree: string;

  @Column({ name: 'field_of_study', nullable: true })
  fieldOfStudy: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  gpa: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  company: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
