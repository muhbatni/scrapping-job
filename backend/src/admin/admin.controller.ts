import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { CrawlLogsService } from '../crawl-logs/crawl-logs.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly crawlLogsService: CrawlLogsService,
  ) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers() {
    return this.usersService.findAll();
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  @Put('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Get('crawl-stats')
  @ApiOperation({ summary: 'Get crawl statistics' })
  getCrawlStats() {
    return this.crawlLogsService.getStats();
  }

  @Get('error-logs')
  @ApiOperation({ summary: 'Get error logs' })
  getErrorLogs() {
    return this.crawlLogsService.getErrorLogs();
  }
}
