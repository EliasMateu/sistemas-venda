import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.ensureEmailUnique(dto.email);
    await this.ensureNameUnique(dto.name);

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({ ...dto, password: hashed });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deleted: false },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email, deleted: false } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      await this.ensureEmailUnique(dto.email);
    }

    if (dto.name && dto.name !== user.name) {
      await this.ensureNameUnique(dto.name);
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.deleted = true;
    await this.userRepository.save(user);
  }

  private async ensureEmailUnique(email: string): Promise<void> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException('E-mail já cadastrado');
  }

  private async ensureNameUnique(name: string): Promise<void> {
    const existing = await this.userRepository.findOne({ where: { name } });
    if (existing) throw new ConflictException('Nome de usuário já cadastrado');
  }
}
