import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { HashService } from './hash.service.js';
import { emailSchema, passwordSchema } from '@cad/shared';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly hash: HashService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await this.hash.verify(user.passwordHash, password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async generateTokens(userId: string, role: string): Promise<TokenPair> {
    const payload = { sub: userId, role };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
      secret: this.config.get('JWT_ACCESS_SECRET')
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_REFRESH_TTL', '7d'),
      secret: this.config.get('JWT_REFRESH_SECRET')
    });
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken } });
    return { accessToken, refreshToken };
  }

  async register(email: string, password: string) {
    const parsedEmail = emailSchema.parse(email.toLowerCase());
    const parsedPassword = passwordSchema.parse(password);
    const existing = await this.prisma.user.findUnique({ where: { email: parsedEmail } });
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }
    const passwordHash = await this.hash.hash(parsedPassword);
    const user = await this.prisma.user.create({
      data: {
        email: parsedEmail,
        passwordHash,
        role: 'CITIZEN'
      }
    });
    return this.generateTokens(user.id, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.generateTokens(user.id, user.role);
  }

  async refresh(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh');
    }
    if (user.refreshToken !== token) {
      throw new UnauthorizedException('Invalid refresh');
    }
    return this.generateTokens(user.id, user.role);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  }
}
