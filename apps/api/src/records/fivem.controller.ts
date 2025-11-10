import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnitService } from './unit.service.js';
import { IncidentService } from './incident.service.js';
import { createHmac } from 'crypto';
import { z } from 'zod';

const telemetrySchema = z.object({
  callsign: z.string(),
  lat: z.number(),
  lng: z.number(),
  heading: z.number().optional(),
  speed: z.number().optional()
});

@Controller('fivem')
export class FiveMController {
  constructor(
    private readonly config: ConfigService,
    private readonly units: UnitService,
    private readonly incidents: IncidentService
  ) {}

  private isEnabled() {
    return this.config.get('FEATURE_FIVEM', 'true') === 'true';
  }

  @Post('telemetry/unit-location')
  async telemetry(@Body() body: any, @Headers('x-signature') signature?: string) {
    if (!this.isEnabled()) {
      return { message: 'Integration disabled' };
    }
    const dto = telemetrySchema.parse(body);
    const secret = this.config.get('HMAC_SECRET', 'dev-hmac-secret');
    const computed = createHmac('sha256', secret).update(JSON.stringify(dto)).digest('hex');
    if (computed !== signature) {
      return { status: 'ignored' };
    }
    const unit = await this.units.findByCallsign(dto.callsign);
    if (!unit) {
      return { status: 'unknown_unit' };
    }
    await this.units.updateLocation(unit.id, dto.lat, dto.lng, dto.heading, dto.speed);
    return { status: 'ok' };
  }

  @Get('public/current-calls')
  async currentCalls() {
    if (!this.isEnabled()) return { data: [] };
    const incidents = await this.incidents.listActive();
    return { data: incidents };
  }

  @Get('public/unit-statuses')
  async unitStatuses() {
    if (!this.isEnabled()) return { data: [] };
    const units = await this.units.list();
    return { data: units };
  }
}
