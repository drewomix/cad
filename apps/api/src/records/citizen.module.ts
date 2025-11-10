import { Module } from '@nestjs/common';
import { CitizenService } from './citizen.service.js';
import { CitizenController } from './citizen.controller.js';
import { AuditModule } from './audit.module.js';
import { SearchController } from './search.controller.js';

@Module({
  imports: [AuditModule],
  providers: [CitizenService],
  controllers: [CitizenController, SearchController],
  exports: [CitizenService]
})
export class CitizenModule {}
