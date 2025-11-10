import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UnitService } from './unit.service.js';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { CurrentUser } from '../security/current-user.decorator.js';
import { DutyStatus } from '@cad/shared';
import { z } from 'zod';

@Controller('units')
@UseGuards(JwtAuthGuard)
export class UnitController {
  constructor(private readonly units: UnitService) {}

  @Get()
  list() {
    return this.units.list();
  }

  @Post(':id/duty')
  duty(
    @CurrentUser('sub') userId: string,
    @Param('id') unitId: string,
    @Body('status') status: DutyStatus
  ) {
    return this.units.setDuty(userId, unitId, status);
  }

  @Post(':id/location')
  updateLocation(@Param('id') unitId: string, @Body() body: any) {
    const dto = z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        heading: z.number().optional(),
        speed: z.number().optional()
      })
      .parse(body);
    return this.units.updateLocation(unitId, dto.lat, dto.lng, dto.heading, dto.speed);
  }
}
