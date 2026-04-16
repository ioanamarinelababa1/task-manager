import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
  app.use(helmet());

  // ── Parse cookies so JwtStrategy can read the access_token cookie
  app.use(cookieParser());

  // ── Global exception filter: consistent error shape, no stack trace leakage
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Global input validation: strip unknown fields, auto-transform types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip properties not in the DTO
      forbidNonWhitelisted: true, // reject requests that include unknown properties
      transform: true,            // auto-cast route params / body to declared types
    }),
  );

  // ── CORS: only the frontend origin, explicit methods and headers
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // required so the browser sends httpOnly cookies cross-origin
  });

  // ── Swagger: UI at /api, JSON spec at /api-json
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('REST API for Task Manager — built with NestJS, TypeORM, PostgreSQL')
    .setVersion('1.0')
    .addTag('auth', 'Authentication — register, login, logout, token refresh')
    .addTag('tasks', 'Task CRUD — create, read, update, delete tasks')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
