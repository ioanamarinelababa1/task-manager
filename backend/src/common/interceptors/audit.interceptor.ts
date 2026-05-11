import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const AUDITED_METHODS = new Set(['POST', 'PUT', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, path, ip } = req;

    if (!AUDITED_METHODS.has(method)) {
      return next.handle();
    }

    const res = context.switchToHttp().getResponse<Response>();
    const userId =
      (req.user as { id?: string | number } | undefined)?.id ?? 'anonymous';

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            event: 'audit',
            userId,
            method,
            path,
            statusCode: res.statusCode,
            ip,
            timestamp: new Date().toISOString(),
          }),
        );
      }),
    );
  }
}
