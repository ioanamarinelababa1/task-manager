import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';

const makeContext = (method: string, user?: { id: number | string }) => {
  const req = { method, path: '/tasks', ip: '127.0.0.1', user };
  const res = { statusCode: 201 };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext;
};

const makeHandler = (): CallHandler => ({ handle: () => of('result') });

const getLogger = (i: AuditInterceptor): Logger =>
  (i as unknown as { logger: Logger }).logger;

const complete = (obs: ReturnType<AuditInterceptor['intercept']>) =>
  new Promise<void>((resolve) => obs.subscribe({ complete: resolve }));

const firstLogArg = (spy: jest.SpyInstance): string =>
  (spy.mock.calls as Array<[string]>)[0][0];

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new AuditInterceptor();
    logSpy = jest
      .spyOn(getLogger(interceptor), 'log')
      .mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it.each(['POST', 'PUT', 'DELETE'])('logs %s requests', async (method) => {
    await complete(
      interceptor.intercept(makeContext(method, { id: 7 }), makeHandler()),
    );
    expect(logSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(firstLogArg(logSpy)) as Record<string, unknown>;
    expect(entry.event).toBe('audit');
    expect(entry.method).toBe(method);
    expect(entry.path).toBe('/tasks');
    expect(entry.statusCode).toBe(201);
    expect(entry.ip).toBe('127.0.0.1');
    expect(entry.userId).toBe(7);
    expect(entry).toHaveProperty('timestamp');
  });

  it('does not log GET requests', async () => {
    await complete(interceptor.intercept(makeContext('GET'), makeHandler()));
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('uses "anonymous" for unauthenticated requests', async () => {
    await complete(interceptor.intercept(makeContext('POST'), makeHandler()));
    const entry = JSON.parse(firstLogArg(logSpy)) as Record<string, unknown>;
    expect(entry.userId).toBe('anonymous');
  });

  it('never includes body or authorization in the log entry', async () => {
    await complete(
      interceptor.intercept(makeContext('POST', { id: 1 }), makeHandler()),
    );
    const raw = firstLogArg(logSpy);
    expect(raw).not.toContain('body');
    expect(raw).not.toContain('password');
    expect(raw).not.toContain('authorization');
  });
});
