import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/common/dtos/user/register.dto';
import { UpdateUserDto } from 'src/common/dtos/user/update.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<void> {
    const existing = await this.usersRepository.findOne({
      where: [
        { cpf: dto.cpf },
        { email: dto.email },
        { telephone: dto.telephone },
      ],
    });

    if (existing) {
      if (existing.cpf === dto.cpf)
        throw new ConflictException('CPF já está em uso');
      if (existing.email === dto.email)
        throw new ConflictException('E-mail já está em uso');
      throw new ConflictException('Telefone já está em uso');
    }

    dto.password = await bcrypt.hash(dto.password, 10);

    const newUser = this.usersRepository.create(dto);
    await this.usersRepository.save(newUser);
  }

  findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        password: true,
        role: true,
      },
    });
  }

  findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        role: true,
        refreshToken: true,
      },
    });
  }

  async getProfile(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        telephone: true,
        cpf: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
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

    const existing = await this.usersRepository.findOne({
      where: [{ email: dto.email }, { telephone: dto.telephone }],
    });

    if (existing && existing.id !== id) {
      if (existing.email === dto.email)
        throw new ConflictException('E-mail já está em uso');
      throw new ConflictException('Telefone já está em uso');
    }

    Object.assign(user, {
      fullName: dto.fullName ?? user.fullName,
      telephone: dto.telephone ?? user.telephone,
      email: dto.email ?? user.email,
    });

    await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { addresses: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.usersRepository.remove(user);
  }
}
