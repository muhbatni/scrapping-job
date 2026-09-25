import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(email: string, password: string, role: UserRole = UserRole.USER): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, rounds);

    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      role,
    });

    return this.userRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'isActive'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ relations: ['profile'] });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return this.userRepo.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    return this.userRepo.save(user);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
