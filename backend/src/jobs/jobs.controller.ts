import {
  Controller, Get, Post, Query, Param, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';
import { JobsService } from './jobs.service';
import { JobSearchDto } from './jobs.dto';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Search jobs with filters' })
  search(@Query() dto: JobSearchDto) {
    return this.jobsService.search(dto);
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get bookmarked jobs' })
  getBookmarks(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.jobsService.getBookmarks(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job details' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const job = await this.jobsService.findById(id);
    await this.jobsService.markViewed(user.id, id);

    const bookmarked = await this.jobsService.isBookmarked(user.id, id);
    return { ...job, bookmarked, viewed: true };
  }

  @Post(':id/bookmark')
  @ApiOperation({ summary: 'Toggle bookmark on a job' })
  toggleBookmark(@CurrentUser() user: User, @Param('id') id: string) {
    return this.jobsService.toggleBookmark(user.id, id);
  }
}
