import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { JobSourcesService } from './job-sources.service';
import { JobSourceType } from './job-source.entity';
import { CreateJobSourceDto, UpdateJobSourceDto } from './job-sources.dto';

@ApiTags('job-sources')
@ApiBearerAuth()
@Controller('job-sources')
@UseGuards(JwtAuthGuard)
export class JobSourcesController {
  constructor(private readonly sourcesService: JobSourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all job sources' })
  findAll(@Query('type') type?: JobSourceType) {
    return this.sourcesService.findAll(type);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active job sources' })
  findActive() {
    return this.sourcesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job source by ID' })
  findOne(@Param('id') id: string) {
    return this.sourcesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create job source (admin)' })
  create(@Body() dto: CreateJobSourceDto) {
    return this.sourcesService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update job source (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateJobSourceDto) {
    return this.sourcesService.update(id, dto);
  }

  @Put(':id/toggle')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Toggle job source active status (admin)' })
  toggle(@Param('id') id: string) {
    return this.sourcesService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete job source (admin)' })
  delete(@Param('id') id: string) {
    return this.sourcesService.delete(id);
  }
}
