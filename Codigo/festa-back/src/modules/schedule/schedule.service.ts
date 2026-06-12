import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleItem } from 'src/common/entities/schedule-item.entity';
import { CreateScheduleItemDto } from 'src/common/dtos/schedule/create-schedule-item.dto';
import { UpdateScheduleItemDto } from 'src/common/dtos/schedule/update-schedule-item.dto';
import { ScheduleGateway } from './schedule.gateway';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleItem)
    private repository: Repository<ScheduleItem>,
    private gateway: ScheduleGateway,
  ) {}

  // RF-13: automatic chronological ordering.
  findAll(): Promise<ScheduleItem[]> {
    return this.repository.find({ order: { plannedTime: 'ASC' } });
  }

  async create(dto: CreateScheduleItemDto): Promise<ScheduleItem> {
    const item = await this.repository.save(this.repository.create(dto));
    this.gateway.emitChanged();
    return item;
  }

  async update(id: number, dto: UpdateScheduleItemDto): Promise<ScheduleItem> {
    const item = await this.getOrFail(id);
    Object.assign(item, {
      name: dto.name ?? item.name,
      plannedTime: dto.plannedTime ?? item.plannedTime,
    });
    const saved = await this.repository.save(item);
    this.gateway.emitChanged();
    return saved;
  }

  // RF-11: record the real start time.
  async start(id: number): Promise<ScheduleItem> {
    const item = await this.getOrFail(id);
    item.actualStartTime = new Date();
    const saved = await this.repository.save(item);
    this.gateway.emitChanged();
    return saved;
  }

  // RF-12: conclude with the real end time.
  async conclude(id: number): Promise<ScheduleItem> {
    const item = await this.getOrFail(id);
    const now = new Date();
    if (!item.actualStartTime) item.actualStartTime = now;
    item.actualEndTime = now;
    item.done = true;
    const saved = await this.repository.save(item);
    this.gateway.emitChanged();
    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Item não encontrado');
    this.gateway.emitChanged();
  }

  private async getOrFail(id: number): Promise<ScheduleItem> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item não encontrado');
    return item;
  }
}
