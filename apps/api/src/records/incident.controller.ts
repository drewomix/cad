import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IncidentService } from './incident.service.js';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { RoleGuard } from '../security/role.guard.js';
import { Roles } from '../security/roles.decorator.js';
import { CurrentUser } from '../security/current-user.decorator.js';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentController {
  constructor(private readonly incidents: IncidentService) {}

  @Get()
  list() {
    return this.incidents.listActive();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DISPATCHER', 'SUPERVISOR', 'ADMIN')
  create(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.incidents.createIncident(userId, body);
  }

  @Patch(':id')
  update(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() body: any) {
    return this.incidents.updateIncident(userId, id, body);
  }

  @Post(':id/assign/:unitId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DISPATCHER', 'SUPERVISOR', 'ADMIN')
  assign(@CurrentUser('sub') userId: string, @Param('id') id: string, @Param('unitId') unitId: string) {
    return this.incidents.assignUnit(userId, id, unitId);
  }

  @Post(':id/clear/:unitId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DISPATCHER', 'SUPERVISOR', 'ADMIN')
  clear(@CurrentUser('sub') userId: string, @Param('id') id: string, @Param('unitId') unitId: string) {
    return this.incidents.clearUnit(userId, id, unitId);
  }
}
