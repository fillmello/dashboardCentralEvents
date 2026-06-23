import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleItem } from 'src/common/entities/schedule-item.entity';
import { SEED_SCHEDULE } from './seed-schedule';

/**
 * Seeds the event programação (RF-10..13) on boot, only when the schedule table
 * is empty, so a fresh database is usable without running scripts by hand and a
 * Gestor's later edits/removals are never clobbered.
 *
 * No user accounts are ever seeded — the first Gestor is bootstrapped manually
 * (self-registration creates an Operativo; promote it with a one-off SQL
 * `UPDATE`). Disable schedule seeding with SEED_ON_BOOT=false.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seed');

  constructor(
    @InjectRepository(ScheduleItem)
    private readonly scheduleRepository: Repository<ScheduleItem>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_ON_BOOT === 'false') return;
    await this.seedSchedule();
  }

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
