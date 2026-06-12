import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * A "momento" of the event schedule (RF-10..13). Items are ordered
 * chronologically by `plannedTime`. The actual start/end are recorded on the
 * fly so the UI can show delays/early starts (RF-11) and conclusion (RF-12).
 */
@Entity('schedule_item')
export class ScheduleItem extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'timestamptz' })
  plannedTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualStartTime: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  actualEndTime: Date | null;

  @Column({ type: 'boolean', default: false })
  done: boolean;
}
