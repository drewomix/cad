import { Module } from '@nestjs/common';
import { IncidentService } from './incident.service.js';
import { IncidentController } from './incident.controller.js';
import { AuditModule } from './audit.module.js';
import { RealtimeModule } from './realtime.module.js';

@Module({
  imports: [AuditModule, RealtimeModule],
  providers: [IncidentService],
  controllers: [IncidentController],
  exports: [IncidentService]
})
export class IncidentModule {}
