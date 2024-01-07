import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { AtGuard } from './common/guards';
import { TwoFactorGuard } from './common/guards/twoFactor.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const reflector = new Reflector();
  app.useGlobalGuards(new AtGuard(reflector));
  app.useGlobalGuards(new TwoFactorGuard(reflector));
  app.enableCors({
    origin: process.env.FRONT_URL,
    credentials: true,
  });

  await app.listen(3001);
}

bootstrap();
config();
