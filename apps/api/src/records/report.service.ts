import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';
import { RealtimeGateway } from './realtime.gateway.js';
import { reportSchema } from '@cad/shared';

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimeGateway
  ) {}

  listForIncident(incidentId: string) {
    return this.prisma.report.findMany({ where: { incidentId }, orderBy: { createdAt: 'desc' } });
  }

  listQueue() {
    return this.prisma.report.findMany({
      where: { status: 'SUBMITTED' },
      orderBy: { updatedAt: 'desc' },
      include: {
        incident: true,
        author: { select: { email: true } }
      }
    });
  }

  async createDraft(userId: string, body: any) {
    const dto = reportSchema.parse(body);
    const report = await this.prisma.report.create({
      data: {
        incidentId: dto.incidentId,
        authorId: userId,
        type: dto.type,
        bodyRtf: dto.bodyRtf,
        status: 'DRAFT'
      }
    });
    await this.audit.log(userId, 'report.created', 'Report', report.id, dto);
    return report;
  }

  async submit(userId: string, reportId: string) {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'SUBMITTED' }
    });
    await this.audit.log(userId, 'report.submitted', 'Report', reportId, {});
    this.realtime.emit('report:submitted', report);
    return report;
  }

  async approve(userId: string, reportId: string, status: 'APPROVED' | 'REJECTED') {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { status, approvedById: userId }
    });
    await this.audit.log(userId, `report.${status.toLowerCase()}`, 'Report', reportId, {});
    this.realtime.emit(status === 'APPROVED' ? 'report:approved' : 'report:rejected', updated);
    return updated;
  }
}
