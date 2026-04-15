import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter — ensures:
 *  1. 500 errors never leak stack traces or internal messages to the client.
 *  2. All error responses share a consistent shape: { statusCode, message, timestamp }.
 *  3. Full error details are logged server-side for debugging.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string | string[];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      // class-validator returns { message: string[] } for validation errors
      message =
        typeof body === 'object' && body !== null && 'message' in body
          ? (body as { message: string | string[] }).message
          : exception.message;
    } else {
      // Unexpected error — log everything server-side, return nothing useful to client
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      console.error(
        `[${new Date().toISOString()}] Unhandled exception on ${request.method} ${request.url}:`,
        exception,
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
