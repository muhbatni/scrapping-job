import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from './application.entity';
import { CreateApplicationDto, UpdateStatusDto } from './applications.dto';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly appService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create application' })
  create(@CurrentUser() user: User, @Body() dto: CreateApplicationDto) {
    return this.appService.create(user.id, dto.jobId, dto.notes);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  findAll(
    @CurrentUser() user: User,
    @Query('status') status?: ApplicationStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.appService.findAll(user.id, status, page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  getStats(@CurrentUser() user: User) {
    return this.appService.getStats(user.id);
  }

  @Get('monthly-stats')
  @ApiOperation({ summary: 'Get monthly statistics' })
  getMonthlyStats(@CurrentUser() user: User) {
    return this.appService.getMonthlyStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application details' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.appService.findOne(id, user.id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get application status history' })
  getHistory(@Param('id') id: string) {
    return this.appService.getHistory(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update application status' })
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appService.updateStatus(id, user.id, dto.status, dto.notes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.appService.delete(id, user.id);
  }
}
