import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateScheduleItemDto } from 'src/common/dtos/schedule/create-schedule-item.dto';
import { UpdateScheduleItemDto } from 'src/common/dtos/schedule/update-schedule-item.dto';

// Everyone with the dashboard sees the cronograma; the Operativo (Individual)
// also reads it for the simplified mobile view on /tarefas. Editing it stays
// Coordenação-only (the @Roles(Role.GESTAO) routes below) — Heads only view.
const VIEW_ROLES = [
  Role.GESTAO,
  Role.HEAD,
  Role.PAINEL,
  Role.INDIVIDUAL,
] as const;

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // Everyone sees the operational schedule.
  @Roles(...VIEW_ROLES)
  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  // RF-20: programming is controlled by the Gestor.
  @Roles(Role.GESTAO)
  @Post()
  create(@Body() dto: CreateScheduleItemDto) {
    return this.scheduleService.create(dto);
  }

  @Roles(Role.GESTAO)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleItemDto,
  ) {
    return this.scheduleService.update(id, dto);
  }

  @Roles(Role.GESTAO)
  @Patch(':id/start')
  start(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.start(id);
  }

  @Roles(Role.GESTAO)
  @Patch(':id/conclude')
  conclude(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.conclude(id);
  }

  // Reopen a concluded moment: clears the real start/end and the done flag so it
  // returns to the "não concluído" state and can run again.
  @Roles(Role.GESTAO)
  @Patch(':id/restart')
  restart(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.restart(id);
  }

  @Roles(Role.GESTAO)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }
}
