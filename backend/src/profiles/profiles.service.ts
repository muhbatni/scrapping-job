import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Skill, Education, Experience } from './profile-related.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
    @InjectRepository(Skill) private skillRepo: Repository<Skill>,
    @InjectRepository(Education) private educationRepo: Repository<Education>,
    @InjectRepository(Experience) private experienceRepo: Repository<Experience>,
  ) {}

  // Profile CRUD
  async getProfile(userId: string): Promise<UserProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId });
      profile = await this.profileRepo.save(profile);
    }
    return profile;
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    let profile = await this.getProfile(userId);
    Object.assign(profile, data);
    return this.profileRepo.save(profile);
  }

  // Skills CRUD
  async getSkills(userId: string): Promise<Skill[]> {
    return this.skillRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async addSkill(userId: string, name: string, level: number = 1): Promise<Skill> {
    const skill = this.skillRepo.create({ userId, name, level });
    return this.skillRepo.save(skill);
  }

  async updateSkill(id: string, userId: string, data: Partial<Skill>): Promise<Skill> {
    const skill = await this.skillRepo.findOne({ where: { id, userId } });
    if (!skill) throw new NotFoundException('Skill tidak ditemukan');
    Object.assign(skill, data);
    return this.skillRepo.save(skill);
  }

  async removeSkill(id: string, userId: string): Promise<void> {
    await this.skillRepo.delete({ id, userId });
  }

  // Education CRUD
  async getEducation(userId: string): Promise<Education[]> {
    return this.educationRepo.find({ where: { userId }, order: { startDate: 'DESC' } });
  }

  async addEducation(userId: string, data: Partial<Education>): Promise<Education> {
    const edu = this.educationRepo.create({ ...data, userId });
    return this.educationRepo.save(edu);
  }

  async updateEducation(id: string, userId: string, data: Partial<Education>): Promise<Education> {
    const edu = await this.educationRepo.findOne({ where: { id, userId } });
    if (!edu) throw new NotFoundException('Pendidikan tidak ditemukan');
    Object.assign(edu, data);
    return this.educationRepo.save(edu);
  }

  async removeEducation(id: string, userId: string): Promise<void> {
    await this.educationRepo.delete({ id, userId });
  }

  // Experience CRUD
  async getExperiences(userId: string): Promise<Experience[]> {
    return this.experienceRepo.find({ where: { userId }, order: { startDate: 'DESC' } });
  }

  async addExperience(userId: string, data: Partial<Experience>): Promise<Experience> {
    const exp = this.experienceRepo.create({ ...data, userId });
    return this.experienceRepo.save(exp);
  }

  async updateExperience(id: string, userId: string, data: Partial<Experience>): Promise<Experience> {
    const exp = await this.experienceRepo.findOne({ where: { id, userId } });
    if (!exp) throw new NotFoundException('Pengalaman tidak ditemukan');
    Object.assign(exp, data);
    return this.experienceRepo.save(exp);
  }

  async removeExperience(id: string, userId: string): Promise<void> {
    await this.experienceRepo.delete({ id, userId });
  }
}
