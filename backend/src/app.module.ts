import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ConfigModule makes process.env values available via ConfigService throughout the app.
    // isGlobal:true means it does not need to be re-imported in every feature module.
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM connects to the PostgreSQL database specified by DATABASE_URL.
    // autoLoadEntities picks up every entity registered with TypeOrmModule.forFeature().
    // synchronize:true auto-creates/alters tables in development — disable in production.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
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
