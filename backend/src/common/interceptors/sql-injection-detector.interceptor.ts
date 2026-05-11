import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

const SQL_PATTERNS: { name: string; pattern: RegExp }[] = [
  {
    name: 'sql_keyword',
    pattern: /\b(DROP|DELETE|INSERT|UPDATE|UNION|SELECT)\s/i,
  },
  { name: 'sql_comment', pattern: /--/ },
  { name: 'statement_chain', pattern: /;\s*(DROP|DELETE)/i },
  { name: 'boolean_injection', pattern: /\b(OR|AND)\s+1\s*=\s*1/i },
];

function collectStrings(obj: unknown, results: string[] = []): string[] {
  if (typeof obj === 'string') {
    results.push(obj);
  } else if (Array.isArray(obj)) {
    for (const item of obj) collectStrings(item, results);
  } else if (obj !== null && typeof obj === 'object') {
    for (const val of Object.values(obj)) collectStrings(val, results);
  }
  return results;
}

@Injectable()
export class SqlInjectionDetectorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SqlInjectionDetectorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const body: unknown = req.body;

    if (body && typeof body === 'object') {
      const userId =
        (req.user as { id?: string | number } | undefined)?.id ?? 'anonymous';
      const { method, path, ip } = req;

      for (const value of collectStrings(body)) {
        for (const { name, pattern } of SQL_PATTERNS) {
          if (pattern.test(value)) {
            this.logger.warn(
              JSON.stringify({
                event: 'sql_injection_attempt',
                userId,
                ip,
                path,
                method,
                matchedPattern: name,
              }),
            );
            break;
          }
        }
      }
    }

    return next.handle();
  }
}
