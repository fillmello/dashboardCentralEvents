import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/common/entities/user.entity';
import { SEED_ACCOUNTS, SEED_PASSWORD } from './seed-accounts';

/**
 * Ensures the demo accounts (one per role) exist every time the app boots, so a
 * fresh/reset database is always usable without running `pnpm seed` by hand.
 *
 * Idempotent: only missing emails are created. Disable with SEED_ON_BOOT=false.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seed');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_ON_BOOT === 'false') return;

    const existing = await this.usersRepository.find({
      where: SEED_ACCOUNTS.map((a) => ({ email: a.email })),
      select: { email: true },
    });
    const existingEmails = new Set(existing.map((u) => u.email));

    const missing = SEED_ACCOUNTS.filter((a) => !existingEmails.has(a.email));
    if (missing.length === 0) return;

    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    await this.usersRepository.save(
      missing.map((a) =>
        this.usersRepository.create({
          fullName: a.fullName,
          email: a.email,
          password: passwordHash,
          role: a.role,
        }),
      ),
    );

    this.logger.log(
      `Seeded ${missing.length} account(s): ${missing
        .map((a) => a.email)
        .join(', ')} (senha: ${SEED_PASSWORD})`,
    );
  }
}
