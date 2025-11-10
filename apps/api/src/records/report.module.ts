import { Module } from '@nestjs/common';
import { ReportService } from './report.service.js';
import { ReportController } from './report.controller.js';
import { AuditModule } from './audit.module.js';
import { RealtimeModule } from './realtime.module.js';
import { PrintController } from './print.controller.js';

@Module({
  imports: [AuditModule, RealtimeModule],
  providers: [ReportService],
  controllers: [ReportController, PrintController],
  exports: [ReportService]
})
export class ReportModule {}
