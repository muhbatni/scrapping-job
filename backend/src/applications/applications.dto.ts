import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from './application.entity';

export class CreateApplicationDto {
  @ApiProperty() @IsUUID() jobId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: ApplicationStatus }) @IsEnum(ApplicationStatus) status: ApplicationStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
