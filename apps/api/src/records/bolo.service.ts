import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';
import { RealtimeGateway } from './realtime.gateway.js';
import { boloSchema } from '@cad/shared';

@Injectable()
export class BoloService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeGateway
  ) {}

  listActive() {
    return this.prisma.bolo.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  }

  async create(userId: string, body: any) {
    const dto = boloSchema.parse(body);
    const bolo = await this.prisma.bolo.create({
      data: {
        category: dto.category,
        subjectRef: dto.subjectRef,
        description: dto.description,
        lastSeenLocation: dto.lastSeenLocation,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdById: userId
      }
    });
    await this.audit.log(userId, 'bolo.created', 'Bolo', bolo.id, dto);
    this.realtime.emit('bolo:created', bolo);
    return bolo;
  }

  async update(userId: string, id: string, data: any) {
    const bolo = await this.prisma.bolo.findUnique({ where: { id } });
    if (!bolo) throw new NotFoundException('BOLO not found');
    const updated = await this.prisma.bolo.update({ where: { id }, data });
    await this.audit.log(userId, 'bolo.updated', 'Bolo', id, data);
    this.realtime.emit('bolo:updated', updated);
    return updated;
  }

  async clear(userId: string, id: string) {
    const updated = await this.prisma.bolo.update({ where: { id }, data: { isActive: false } });
    await this.audit.log(userId, 'bolo.cleared', 'Bolo', id, {});
    this.realtime.emit('bolo:cleared', updated);
    return updated;
  }
}
