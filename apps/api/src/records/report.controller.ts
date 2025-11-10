import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service.js';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { CurrentUser } from '../security/current-user.decorator.js';
import { RoleGuard } from '../security/role.guard.js';
import { Roles } from '../security/roles.decorator.js';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reports: ReportService) {}

  @Get('incident/:id')
  list(@Param('id') id: string) {
    return this.reports.listForIncident(id);
  }

  @Get('queue')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('SUPERVISOR', 'ADMIN', 'RECORDS')
  queue() {
    return this.reports.listQueue();
  }

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.reports.createDraft(userId, body);
  }

  @Post(':id/submit')
  submit(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.reports.submit(userId, id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('SUPERVISOR', 'ADMIN')
  approve(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body('status') status: 'APPROVED' | 'REJECTED') {
    return this.reports.approve(userId, id, status);
  }
}
