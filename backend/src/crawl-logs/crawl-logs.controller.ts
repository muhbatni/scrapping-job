import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CrawlLogsService } from './crawl-logs.service';

@ApiTags('crawl-logs')
@ApiBearerAuth()
@Controller('crawl-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CrawlLogsController {
  constructor(private readonly logsService: CrawlLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all crawl logs' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sourceId') sourceId?: string,
  ) {
    return this.logsService.findAll(page, limit, sourceId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent crawl logs' })
  getRecent(@Query('limit') limit?: number) {
    return this.logsService.getRecentLogs(limit);
  }

  @Get('errors')
  @ApiOperation({ summary: 'Get error crawl logs' })
  getErrors(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.logsService.getErrorLogs(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get crawl statistics' })
  getStats() {
    return this.logsService.getStats();
  }
}
