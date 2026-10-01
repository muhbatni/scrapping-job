import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/user.entity';
import { ProfilesService } from './profiles.service';
import {
  UpdateProfileDto,
  CreateSkillDto,
  UpdateSkillDto,
  CreateEducationDto,
  UpdateEducationDto,
  CreateExperienceDto,
  UpdateExperienceDto,
} from './profiles.dto';

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // Profile endpoints
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: User) {
    return this.profilesService.getProfile(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(user.id, dto);
  }

  // Skills endpoints
  @Get('skills')
  @ApiOperation({ summary: 'Get user skills' })
  getSkills(@CurrentUser() user: User) {
    return this.profilesService.getSkills(user.id);
  }

  @Post('skills')
  @ApiOperation({ summary: 'Add a skill' })
  addSkill(@CurrentUser() user: User, @Body() dto: CreateSkillDto) {
    return this.profilesService.addSkill(user.id, dto.name, dto.level);
  }

  @Put('skills/:id')
  @ApiOperation({ summary: 'Update a skill' })
  updateSkill(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.profilesService.updateSkill(id, user.id, dto);
  }

  @Delete('skills/:id')
  @ApiOperation({ summary: 'Remove a skill' })
  removeSkill(@CurrentUser() user: User, @Param('id') id: string) {
    return this.profilesService.removeSkill(id, user.id);
  }

  // Education endpoints
  @Get('education')
  @ApiOperation({ summary: 'Get user education history' })
  getEducation(@CurrentUser() user: User) {
    return this.profilesService.getEducation(user.id);
  }

  @Post('education')
  @ApiOperation({ summary: 'Add education' })
  addEducation(@CurrentUser() user: User, @Body() dto: CreateEducationDto) {
    return this.profilesService.addEducation(user.id, dto);
  }

  @Put('education/:id')
  @ApiOperation({ summary: 'Update education' })
  updateEducation(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateEducationDto) {
    return this.profilesService.updateEducation(id, user.id, dto);
  }

  @Delete('education/:id')
  @ApiOperation({ summary: 'Remove education' })
  removeEducation(@CurrentUser() user: User, @Param('id') id: string) {
    return this.profilesService.removeEducation(id, user.id);
  }

  // Experience endpoints
  @Get('experiences')
  @ApiOperation({ summary: 'Get user experiences' })
  getExperiences(@CurrentUser() user: User) {
    return this.profilesService.getExperiences(user.id);
  }

  @Post('experiences')
  @ApiOperation({ summary: 'Add experience' })
  addExperience(@CurrentUser() user: User, @Body() dto: CreateExperienceDto) {
    return this.profilesService.addExperience(user.id, dto);
  }

  @Put('experiences/:id')
  @ApiOperation({ summary: 'Update experience' })
  updateExperience(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateExperienceDto) {
    return this.profilesService.updateExperience(id, user.id, dto);
  }

  @Delete('experiences/:id')
  @ApiOperation({ summary: 'Remove experience' })
  removeExperience(@CurrentUser() user: User, @Param('id') id: string) {
    return this.profilesService.removeExperience(id, user.id);
  }
}
