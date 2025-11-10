import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';
import { RealtimeGateway } from './realtime.gateway.js';
import { incidentSchema } from '@cad/shared';
import { toPostgresPoint } from '@cad/shared';

@Injectable()
export class IncidentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeGateway
  ) {}

  listActive() {
    return this.prisma.incident.findMany({
      where: { status: { in: ['OPEN', 'ASSIGNED', 'ON_SCENE'] } },
      orderBy: { openedAt: 'desc' },
      include: {
        units: { include: { unit: true } },
        reports: true,
        arrests: true,
        citations: true
      }
    });
  }

  async createIncident(actorId: string, body: any) {
    const dto = incidentSchema.parse(body);
    const incident = await this.prisma.incident.create({
      data: {
        priority: dto.priority,
        type: dto.type,
        address: dto.address,
        narrative: dto.narrative,
        locationGeom: toPostgresPoint({ lat: dto.locationLat, lng: dto.locationLng }),
        createdById: actorId
      }
    });
    await this.audit.log(actorId, 'incident.created', 'Incident', incident.id, dto);
    this.realtime.emit('incident:created', incident);
    return incident;
  }

  async updateIncident(actorId: string, id: string, data: Partial<{ status: string; narrative: string; type: string }>) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');
    const updated = await this.prisma.incident.update({ where: { id }, data });
    await this.audit.log(actorId, 'incident.updated', 'Incident', id, data);
    this.realtime.emit('incident:updated', updated);
    return updated;
  }

  async assignUnit(actorId: string, incidentId: string, unitId: string) {
    await this.prisma.incidentUnit.upsert({
      where: { incidentId_unitId: { incidentId, unitId } },
      update: { clearedAt: null },
      create: { incidentId, unitId }
    });
    await this.audit.log(actorId, 'dispatch.assign', 'Incident', incidentId, { unitId });
    this.realtime.emit('dispatch:assign', { incidentId, unitId });
    return this.prisma.incident.findUnique({
      where: { id: incidentId },
      include: { units: { include: { unit: true } } }
    });
  }

  async clearUnit(actorId: string, incidentId: string, unitId: string) {
    await this.prisma.incidentUnit.update({
      where: { incidentId_unitId: { incidentId, unitId } },
      data: { clearedAt: new Date() }
    });
    await this.audit.log(actorId, 'dispatch.unassign', 'Incident', incidentId, { unitId });
    this.realtime.emit('dispatch:unassign', { incidentId, unitId });
    return this.prisma.incident.findUnique({
      where: { id: incidentId },
      include: { units: { include: { unit: true } } }
    });
  }
}
