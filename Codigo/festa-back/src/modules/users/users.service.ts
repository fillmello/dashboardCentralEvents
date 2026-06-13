import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/common/dtos/user/register.dto';
import { ManagedCreateUserDto } from 'src/common/dtos/user/managed-create.dto';
import { UpdateUserDto } from 'src/common/dtos/user/update.dto';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Self-registration → always INDIVIDUAL (sees only its own tasks).
  async create(dto: CreateUserDto): Promise<void> {
    await this.createWithRole(dto, Role.INDIVIDUAL);
  }

  // Gestão-created account with an explicit role (Gestão or Painel).
  async createManaged(dto: ManagedCreateUserDto): Promise<void> {
    await this.createWithRole(dto, dto.role);
  }

  private async createWithRole(
    dto: CreateUserDto,
    role: Role,
  ): Promise<void> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('E-mail já está em uso');

    const newUser = this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      role,
    });
    await this.usersRepository.save(newUser);
  }

  findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: { id: true, password: true, role: true },
    });
  }

  findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: { id: true, role: true, refreshToken: true },
    });
  }

  async getProfile(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: { id: true, fullName: true, email: true, role: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  // Gestor: roster used for the "responsável" picker and role management.
  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: { id: true, fullName: true, email: true, role: true },
      order: { fullName: 'ASC' },
    });
  }

  async updateRefreshToken(
    id: number,
    hashedToken: string | null,
  ): Promise<void> {
    await this.usersRepository.save({ id, refreshToken: hashedToken });
  }

  async update(id: number, dto: UpdateUserDto): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id)
        throw new ConflictException('E-mail já está em uso');
    }

    Object.assign(user, {
      fullName: dto.fullName ?? user.fullName,
      email: dto.email ?? user.email,
    });
    await this.usersRepository.save(user);
  }

  // Gestor reassigns a user's privilege level.
  async updateRole(id: number, role: Role): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    // The system must always keep at least one Gestor — block demoting the last.
    if (user.role === Role.GESTAO && role !== Role.GESTAO)
      await this.assertNotLastGestor();
    user.role = role;
    await this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    // Don't allow removing the last Gestor (also covers self-deletion).
    if (user.role === Role.GESTAO) await this.assertNotLastGestor();
    await this.usersRepository.delete(id);
  }

  // Guards the "at least one Gestor" invariant. Call before demoting/removing a
  // Gestor — throws when they are the only one left.
  private async assertNotLastGestor(): Promise<void> {
    const gestorCount = await this.usersRepository.count({
      where: { role: Role.GESTAO },
    });
    if (gestorCount <= 1)
      throw new BadRequestException(
        'O sistema precisa ter pelo menos um gestor.',
      );
  }
}
