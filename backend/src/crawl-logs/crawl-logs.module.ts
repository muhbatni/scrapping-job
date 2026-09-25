import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlLog } from './crawl-log.entity';
import { CrawlLogsService } from './crawl-logs.service';
import { CrawlLogsController } from './crawl-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CrawlLog])],
  providers: [CrawlLogsService],
  controllers: [CrawlLogsController],
  exports: [CrawlLogsService],
})
export class CrawlLogsModule {}
