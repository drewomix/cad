import { Module } from '@nestjs/common';
import { BoloService } from './bolo.service.js';
import { BoloController } from './bolo.controller.js';
import { AuditModule } from './audit.module.js';
import { RealtimeModule } from './realtime.module.js';

@Module({
  imports: [AuditModule, RealtimeModule],
  providers: [BoloService],
  controllers: [BoloController]
})
export class BoloModule {}
