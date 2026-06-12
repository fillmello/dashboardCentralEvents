import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Global catch-all. Any thrown value in the request pipeline becomes a clean JSON
 * response instead of escaping (and never a process crash). HttpExceptions keep
 * their status/message; everything else (DB failures, unexpected throws) is logged
 * server-side and returned as a generic 500 — internals are never leaked.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse() as
        | string
        | { message?: string | string[] };
      const message =
        typeof body === 'string' ? body : (body.message ?? exception.message);
      response.status(status).json({
        success: false,
        statusCode: status,
        message: Array.isArray(message) ? message : [message],
      });
      return;
    }

    // Non-HTTP error: log full detail, return a safe generic 500. Never rethrow.
    this.logger.error(
      exception instanceof Error
        ? (exception.stack ?? exception.message)
        : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: [
        exception instanceof QueryFailedError
          ? 'Erro ao processar a solicitação'
          : 'Erro interno do servidor',
      ],
    });
  }
}
