import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { RoleGuard } from '../security/role.guard.js';
import { Roles } from '../security/roles.decorator.js';

@Controller('audits')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('SUPERVISOR', 'ADMIN', 'RECORDS', 'DISPATCHER')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  async list() {
    const logs = await this.audit.findAll();
    return { data: logs };
  }
}
