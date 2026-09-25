import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobSource } from './job-source.entity';
import { JobSourcesService } from './job-sources.service';
import { JobSourcesController } from './job-sources.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobSource])],
  providers: [JobSourcesService],
  controllers: [JobSourcesController],
  exports: [JobSourcesService],
})
export class JobSourcesModule {}
