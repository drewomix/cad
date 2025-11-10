import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { HashService } from '../security/hash.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly hash: HashService) {}

  list() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        agencyId: true,
        createdAt: true
      }
    });
  }

  async create(data: { email: string; role: string; password?: string; agencyId?: string }) {
    const passwordHash = await this.hash.hash(data.password ?? 'ChangeMe123!');
    return this.prisma.user.create({
      data: { email: data.email.toLowerCase(), role: data.role, agencyId: data.agencyId, passwordHash }
    });
  }

  update(id: string, data: Partial<{ role: string; isActive: boolean }>) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
