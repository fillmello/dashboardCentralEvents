import { Controller, Get, Header, StreamableFile } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

// KPIs are part of the global view — Coordenação, Head and Painel can see them.
@Roles(Role.GESTAO, Role.HEAD, Role.PAINEL)
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

  // Real spreadsheet (.xlsx) — opens directly in Google Sheets / Excel.
  @Get('export.xlsx')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="mapa-de-posts.xlsx"')
  async exportXlsx(): Promise<StreamableFile> {
    const buffer = await this.metricsService.exportPostsXlsx();
    return new StreamableFile(buffer);
  }
}
