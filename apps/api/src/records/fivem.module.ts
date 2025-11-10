import { Module } from '@nestjs/common';
import { FiveMController } from './fivem.controller.js';
import { UnitModule } from './unit.module.js';
import { IncidentModule } from './incident.module.js';

@Module({
  imports: [UnitModule, IncidentModule],
  controllers: [FiveMController]
})
export class FiveMModule {}
