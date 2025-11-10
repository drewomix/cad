import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../security/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { CitizenModule } from '../records/citizen.module.js';
import { IncidentModule } from '../records/incident.module.js';
import { UnitModule } from '../records/unit.module.js';
import { ReportModule } from '../records/report.module.js';
import { BoloModule } from '../records/bolo.module.js';
import { AuditModule } from '../records/audit.module.js';
import { FiveMModule } from '../records/fivem.module.js';
import configuration from '../shared/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CitizenModule,
    IncidentModule,
    UnitModule,
    ReportModule,
    BoloModule,
    AuditModule,
    FiveMModule
  ]
})
export class AppModule {}
