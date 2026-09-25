import {
  Controller, Get, Put, Delete, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notifService.findAll(user.id, page, limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread count' })
  getUnreadCount(@CurrentUser() user: User) {
    return this.notifService.getUnreadCount(user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notifService.markAsRead(id, user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all as read' })
  markAllAsRead(@CurrentUser() user: User) {
    return this.notifService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notifService.delete(id, user.id);
  }
}
