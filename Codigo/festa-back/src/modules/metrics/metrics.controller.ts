import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

// KPIs are part of the global view — Gestão and Painel (read-only) can see them.
@Roles(Role.GESTAO, Role.PAINEL)
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('general')
  general() {
    return this.metricsService.general();
  }

  @Get('collaborators')
  perCollaborator() {
    return this.metricsService.perCollaborator();
  }

  @Get('stage-times')
  stageTimes() {
    return this.metricsService.stageTimes();
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="mapa-de-posts.csv"')
  async exportCsv(): Promise<string> {
    const csv = await this.metricsService.exportPostsCsv();
    // Prepend a BOM so Excel opens the UTF-8 file with correct accents.
    return `﻿${csv}`;
  }
}
