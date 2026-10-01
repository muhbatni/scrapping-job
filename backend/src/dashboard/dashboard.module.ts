import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { JobBookmark } from '../jobs/job-interaction.entity';
import { Application } from '../applications/application.entity';
import { CrawlLog } from '../crawl-logs/crawl-log.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Job, JobBookmark, Application, CrawlLog])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
