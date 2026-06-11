import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import { Role } from 'src/common/enums/role.enum';
import * as bcrypt from 'bcrypt';

const SEED_USERS = [
  {
    email: 'admin@gmail.com',
    password: '123',
    fullName: 'Admin',
    cpf: '00000000000',
    telephone: '00000000000',
    role: Role.ADMIN,
  },
  {
    email: 'user@gmail.com',
    password: '123',
    fullName: 'User',
    cpf: '11111111111',
    telephone: '11111111111',
    role: Role.USER,
  },
] as const;

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') return;

    for (const seed of SEED_USERS) {
      const existing = await this.usersRepository.findOneBy({
        email: seed.email,
      });
      if (existing) {
        this.logger.log(
          `Seed account already exists — skipping: ${seed.email}`,
        );
        continue;
      }

      const password = await bcrypt.hash(seed.password, 10);
      await this.usersRepository.save(
        this.usersRepository.create({ ...seed, password }),
      );
      this.logger.log(`Seed account created: ${seed.email}`);
    }
  }
}
