import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CitizenService } from './citizen.service.js';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { RoleGuard } from '../security/role.guard.js';
import { Roles } from '../security/roles.decorator.js';
import { CurrentUser } from '../security/current-user.decorator.js';
import { vehicleSchema } from '@cad/shared';
import { z } from 'zod';

@Controller('citizen')
@UseGuards(JwtAuthGuard)
export class CitizenController {
  constructor(private readonly citizen: CitizenService) {}

  @Get('persons')
  listPersons(@CurrentUser('sub') userId: string) {
    return this.citizen.listPersons(userId);
  }

  @Post('persons')
  createPerson(@CurrentUser('sub') userId: string, @Body() body: any) {
    const dto = personSchema.parse(body);
    return this.citizen.createPerson(userId, dto);
  }

  @Get('vehicles')
  listVehicles(@CurrentUser('sub') userId: string) {
    return this.citizen.listVehicles(userId);
  }

  @Post('vehicles')
  createVehicle(@CurrentUser('sub') userId: string, @Body() body: any) {
    const dto = vehicleSchema.extend({ ownerPersonId: z.string().uuid().optional() }).parse(body);
    return this.citizen.createVehicle(userId, dto as any);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('SUPERVISOR', 'ADMIN', 'RECORDS')
  async pending() {
    const [persons, vehicles] = await this.citizen.pendingSubmissions();
    return { data: { persons, vehicles } };
  }

  @Post('persons/:id/approve')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('SUPERVISOR', 'ADMIN', 'RECORDS')
  approvePerson(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @Body('notes') notes?: string
  ) {
    return this.citizen.approvePerson(userId, id, status, notes);
  }

  @Post('vehicles/:id/approve')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('SUPERVISOR', 'ADMIN', 'RECORDS')
  approveVehicle(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @Body('notes') notes?: string
  ) {
    return this.citizen.approveVehicle(userId, id, status, notes);
  }

  @Post('online-report')
  submitOnlineReport(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.citizen.submitOnlineReport(userId, body);
  }
}
