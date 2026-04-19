import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    // ConfigModule makes process.env values available via ConfigService throughout the app.
    // isGlobal:true means it does not need to be re-imported in every feature module.
    ConfigModule.forRoot({ isGlobal: true }),

    // Structured logging via Pino. Pretty-prints in dev; emits JSON in production.
    // Sensitive fields are redacted before any log line is written.
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
        transport: isDev
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid',
              },
            }
          : undefined,
        redact: [
          'req.headers.authorization',
          'req.body.password',
          'req.body.token',
        ],
      },
    }),

    // TypeORM connects to the PostgreSQL database specified by DATABASE_URL.
    // autoLoadEntities picks up every entity registered with TypeOrmModule.forFeature().
    // In development synchronize keeps the schema in sync automatically.
    // In production, synchronize is off and migrationsRun applies pending migration files on boot.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        migrationsRun: process.env.NODE_ENV === 'production',
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),

    // Global rate limiter: 100 requests per IP per minute as baseline.
    // Individual controllers override this with stricter limits (auth: 10, tasks: 60).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    TasksModule,
    AuthModule,
  ],
  providers: [
    // ThrottlerGuard applied globally via the DI system so every route is covered
    // without decorating each controller individually.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
