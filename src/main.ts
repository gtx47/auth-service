import 'reflect-metadata';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const first = errors[0];
        const messages = first?.constraints
          ? Object.values(first.constraints)
          : ['Datos inválidos'];
        return new BadRequestException(messages[0]);
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3001;

  await app.listen(port);
  new Logger('Bootstrap').log(`[auth] hexagonal :${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[auth] bootstrap fail', err);
  process.exit(1);
});
