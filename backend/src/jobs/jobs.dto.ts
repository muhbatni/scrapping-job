import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkType, JobType, ExperienceLevel } from './job.entity';

export class JobSearchDto {
  @ApiPropertyOptional() @IsOptional() @IsString() keyword?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional({ enum: WorkType }) @IsOptional() @IsEnum(WorkType) workType?: WorkType;
  @ApiPropertyOptional({ enum: JobType }) @IsOptional() @IsEnum(JobType) jobType?: JobType;
  @ApiPropertyOptional({ enum: ExperienceLevel }) @IsOptional() @IsEnum(ExperienceLevel) experienceLevel?: ExperienceLevel;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) salaryMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sourceId?: string;
  @ApiPropertyOptional({ default: 'posted_at' }) @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional({ default: 'DESC' }) @IsOptional() @IsString() sortOrder?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @IsNumber() @Min(1) limit?: number;
}
