import { IsString, IsOptional, IsNumber, Min, Max, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fullName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() portfolioUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() province?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() summary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverLetterTemplate?: string;
}

export class CreateSkillDto {
  @ApiProperty({ example: 'TypeScript' }) @IsString() name: string;
  @ApiPropertyOptional({ example: 3 }) @IsOptional() @IsNumber() @Min(1) @Max(5) level?: number;
}

export class CreateEducationDto {
  @ApiProperty({ example: 'Universitas Indonesia' }) @IsString() institution: string;
  @ApiPropertyOptional({ example: 'S1' }) @IsOptional() @IsString() degree?: string;
  @ApiPropertyOptional({ example: 'Teknik Informatika' }) @IsOptional() @IsString() fieldOfStudy?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() startDate?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;
  @ApiPropertyOptional({ example: 3.75 }) @IsOptional() @IsNumber() gpa?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class UpdateEducationDto extends PartialType(CreateEducationDto) {}

export class CreateExperienceDto {
  @ApiProperty({ example: 'PT Tokopedia' }) @IsString() company: string;
  @ApiProperty({ example: 'Software Engineer' }) @IsString() position: string;
  @ApiPropertyOptional({ example: 'Jakarta' }) @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() startDate?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;
  @ApiPropertyOptional() @IsOptional() isCurrent?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}

