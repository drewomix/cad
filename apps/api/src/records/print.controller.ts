import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

@Controller('print')
@UseGuards(JwtAuthGuard)
export class PrintController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('report/:id')
  async report(@Param('id') id: string, @Res() res: Response) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { incident: true, author: true, approvedBy: true }
    });
    if (!report) {
      res.status(404).send('Report not found');
      return;
    }
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Incident Report', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Incident #: ${report.incident.number}`);
    doc.text(`Type: ${report.incident.type}`);
    doc.text(`Author: ${report.author.email}`);
    doc.text(`Status: ${report.status}`);
    if (report.approvedBy) {
      doc.text(`Approved By: ${report.approvedBy.email}`);
    }
    doc.moveDown();
    doc.text(report.bodyRtf);
    doc.end();
  }

  @Get('citation/:id')
  async citation(@Param('id') id: string, @Res() res: Response) {
    const citation = await this.prisma.citation.findUnique({
      where: { id },
      include: { person: true, officer: true }
    });
    if (!citation) {
      res.status(404).send('Citation not found');
      return;
    }
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Citation', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Person: ${citation.person.firstName} ${citation.person.lastName}`);
    doc.text(`Officer: ${citation.officer.email}`);
    doc.text(`Location: ${citation.location}`);
    doc.text(`Fine Total: $${citation.fineTotal.toFixed(2)}`);
    doc.text(`Violations: ${(citation.violations as string[]).join(', ')}`);
    if (citation.courtDate) doc.text(`Court Date: ${citation.courtDate.toISOString()}`);
    doc.end();
  }
}
