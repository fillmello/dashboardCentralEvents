import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardMetrics() {
    return this.reportsService.getDashboardMetrics();
  }

  @Get('by-user/:userId')
  getUserMetrics(@Param('userId') userId: string) {
    return this.reportsService.getUserMetrics(userId);
  }

  @Get('timeline')
  getTimelineMetrics() {
    return this.reportsService.getTimelineMetrics();
  }

  @Get('platforms')
  getPlatformMetrics() {
    return this.reportsService.getPlatformMetrics();
  }
}
