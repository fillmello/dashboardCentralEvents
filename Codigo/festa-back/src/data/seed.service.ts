import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/common/entities/user.entity';
import { ScheduleItem } from 'src/common/entities/schedule-item.entity';
import { SEED_ACCOUNTS, SEED_PASSWORD } from './seed-accounts';
import { SEED_SCHEDULE } from './seed-schedule';

/**
 * Seeds baseline data every time the app boots, so a fresh/reset database is
 * always usable without running scripts by hand:
 *  - the demo accounts (one per role), idempotent per e-mail;
 *  - the event programação (RF-10..13), only when the schedule is empty.
 *
 * Disable entirely with SEED_ON_BOOT=false.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seed');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ScheduleItem)
    private readonly scheduleRepository: Repository<ScheduleItem>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_ON_BOOT === 'false') return;
    await this.seedAccounts();
    await this.seedSchedule();
  }

  private async seedAccounts(): Promise<void> {
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

  // Only seeds when the schedule is empty, so a Gestor's edits/removals are
  // never clobbered on the next boot.
  private async seedSchedule(): Promise<void> {
    const count = await this.scheduleRepository.count();
    if (count > 0) return;

    await this.scheduleRepository.save(
      SEED_SCHEDULE.map((item) =>
        this.scheduleRepository.create({
          name: item.name,
          plannedTime: new Date(item.plannedTime),
        }),
      ),
    );

    this.logger.log(`Seeded ${SEED_SCHEDULE.length} schedule item(s).`);
  }
}
