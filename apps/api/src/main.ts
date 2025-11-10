import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';
import { PrismaService } from './prisma/prisma.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const config = app.get(ConfigService);
  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);
  const port = config.get('PORT', 3333);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.use(helmet());
  app.use(json({ limit: '2mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true
    })
  );

  const csrfEnabled = config.get('CSRF_PROTECTION', 'true') === 'true';
  if (csrfEnabled) {
    app.use(csurf({ cookie: true }));
  }

  app.enableCors({
    origin: config.get('WEB_ORIGIN', 'http://localhost:5173'),
    credentials: true
  });

  await app.listen(port);
  console.log(`API listening on port ${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
