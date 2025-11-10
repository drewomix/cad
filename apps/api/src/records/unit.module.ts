import { Module } from '@nestjs/common';
import { UnitService } from './unit.service.js';
import { UnitController } from './unit.controller.js';
import { AuditModule } from './audit.module.js';
import { RealtimeModule } from './realtime.module.js';

@Module({
  imports: [AuditModule, RealtimeModule],
  providers: [UnitService],
  controllers: [UnitController],
  exports: [UnitService]
})
export class UnitModule {}
