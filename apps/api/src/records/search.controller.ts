import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../security/jwt.guard.js';
import { RoleGuard } from '../security/role.guard.js';
import { Roles } from '../security/roles.decorator.js';

@Controller('records')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('OFFICER', 'DISPATCHER', 'SUPERVISOR', 'ADMIN', 'RECORDS')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('search')
  async search(@Query('type') type: string, @Query('q') q: string) {
    if (!q) return { data: [] };
    const term = q.trim();
    switch (type) {
      case 'person':
        return {
          data: await this.prisma.person.findMany({
            where: {
              approvalStatus: 'APPROVED',
              OR: [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } }
              ]
            },
            take: 20
          })
        };
      case 'vehicle':
        return {
          data: await this.prisma.vehicle.findMany({
            where: {
              approvalStatus: 'APPROVED',
              OR: [
                { plate: { contains: term, mode: 'insensitive' } },
                { vin: term }
              ]
            },
            take: 20,
            include: { owner: true }
          })
        };
      case 'bolo':
        return { data: await this.prisma.bolo.findMany({ where: { isActive: true }, take: 20 }) };
      default:
        return { data: [] };
    }
  }
}
