import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';
import { RealtimeGateway } from './realtime.gateway.js';
import { DutyStatus } from '@cad/shared';
import { toPostgresPoint } from '@cad/shared';

@Injectable()
export class UnitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeGateway
  ) {}

  list() {
    return this.prisma.unit.findMany({
      include: { user: { select: { id: true, email: true } }, beat: true }
    });
  }

  findByCallsign(callsign: string) {
    return this.prisma.unit.findUnique({ where: { callsign } });
  }

  async setDuty(userId: string, unitId: string, dutyStatus: DutyStatus) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');
    const updated = await this.prisma.unit.update({
      where: { id: unitId },
      data: { dutyStatus, userId, lastSeenAt: new Date() }
    });
    await this.audit.log(userId, 'unit.status', 'Unit', unitId, { dutyStatus });
    this.realtime.emit('unit:status.update', updated);
    return updated;
  }

  async updateLocation(unitId: string, lat: number, lng: number, heading?: number, speed?: number) {
    const updated = await this.prisma.unit.update({
      where: { id: unitId },
      data: {
        locationGeom: toPostgresPoint({ lat, lng }),
        lastSeenAt: new Date()
      }
    });
    this.realtime.emit('unit:status.update', { ...updated, heading, speed });
    return updated;
  }
}
