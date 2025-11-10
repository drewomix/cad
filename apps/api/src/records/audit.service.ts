import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(actorId: string, action: string, entityType: string, entityId: string, diff: unknown) {
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        diffJson: diff as any
      }
    });
  }

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { at: 'desc' },
      take: 200,
      include: { actor: { select: { id: true, email: true } } }
    });
  }
}
