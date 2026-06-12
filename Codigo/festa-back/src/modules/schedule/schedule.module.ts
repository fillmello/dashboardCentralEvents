import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleItem } from 'src/common/entities/schedule-item.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleGateway } from './schedule.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleItem])],
  providers: [ScheduleService, ScheduleGateway],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
