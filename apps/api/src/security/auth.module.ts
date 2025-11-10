import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './jwt.strategy.js';
import { JwtRefreshStrategy } from './jwt-refresh.strategy.js';
import { HashService } from './hash.service.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_ACCESS_TTL', '15m') }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, HashService],
  controllers: [AuthController],
  exports: [AuthService, HashService]
})
export class AuthModule {}
