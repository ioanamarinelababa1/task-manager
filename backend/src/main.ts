import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
