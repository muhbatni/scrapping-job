import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { JobSourcesModule } from '../job-sources/job-sources.module';
import { CrawlLogsModule } from '../crawl-logs/crawl-logs.module';

@Module({
  imports: [UsersModule, JobSourcesModule, CrawlLogsModule],
  controllers: [AdminController],
})
export class AdminModule {}
