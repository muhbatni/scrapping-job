import { IsString, IsOptional, IsEnum, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobSourceType } from './job-source.entity';

export class CreateJobSourceDto {
  @ApiProperty({ example: 'Gojek Careers' }) @IsString() name: string;
  @ApiProperty({ enum: JobSourceType }) @IsEnum(JobSourceType) type: JobSourceType;
  @ApiProperty({ example: 'https://www.gotocompany.com/careers' }) @IsString() baseUrl: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() crawlConfig?: any;
}

export class UpdateJobSourceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ enum: JobSourceType }) @IsOptional() @IsEnum(JobSourceType) type?: JobSourceType;
  @ApiPropertyOptional() @IsOptional() @IsString() baseUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() crawlConfig?: any;
}
