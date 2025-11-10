import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BoloService } from './bolo.service.js';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { CurrentUser } from '../security/current-user.decorator.js';
import { RoleGuard } from '../security/role.guard.js';
import { Roles } from '../security/roles.decorator.js';

@Controller('bolos')
@UseGuards(JwtAuthGuard)
export class BoloController {
  constructor(private readonly bolos: BoloService) {}

  @Get()
  list() {
    return this.bolos.listActive();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DISPATCHER', 'SUPERVISOR', 'ADMIN', 'OFFICER')
  create(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.bolos.create(userId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DISPATCHER', 'SUPERVISOR', 'ADMIN')
  update(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() body: any) {
    return this.bolos.update(userId, id, body);
  }

  @Post(':id/clear')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DISPATCHER', 'SUPERVISOR', 'ADMIN')
  clear(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.bolos.clear(userId, id);
  }
}
