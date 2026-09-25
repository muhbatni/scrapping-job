import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobBookmark, JobView } from './job-interaction.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Job, JobBookmark, JobView])],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
