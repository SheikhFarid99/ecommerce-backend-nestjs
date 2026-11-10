import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from '@nestjs/i18n';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

import {
  ApiErrorDetail,
  ApiErrorResponse,
} from '../interfaces/error-response.interface.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = this.getStatusCode(exception);
    const errorCode = this.getErrorCode(statusCode);

    const result = this.buildErrorResponse(exception, statusCode, errorCode);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      if (exception instanceof Error) {
        this.logger.error(exception.message, exception.stack);
        return;
      }

      this.logger.error(`Unhandled exception: ${String(exception)}`);
    }

    response.status(statusCode).json(result);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorCode(statusCode: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      408: 'REQUEST_TIMEOUT',
      409: 'CONFLICT',
      413: 'PAYLOAD_TOO_LARGE',
      415: 'UNSUPPORTED_MEDIA_TYPE',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };

    return errorCodes[statusCode] || 'HTTP_ERROR';
  }

  private buildErrorResponse(
    exception: unknown,
    statusCode: number,
    errorCode: string,
  ): ApiErrorResponse {
    let message = this.translate('common.INTERNAL_ERROR');
    let errors: ApiErrorDetail[] = [];

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        message = this.translate('common.VALIDATION_FAILED');

        errors = zodError.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: this.translate(issue.message),
        }));
      }
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const data = exceptionResponse as Record<string, unknown>;

        if (typeof data.messageKey === 'string') {
          message = this.translate(data.messageKey);
        } else {
          message = this.getHttpMessage(statusCode);
        }

        if (Array.isArray(data.errors)) {
          errors = data.errors.filter(
            (error): error is ApiErrorDetail =>
              typeof error === 'object' &&
              error !== null &&
              typeof (error as ApiErrorDetail).message === 'string',
          );
        }
      } else {
        message = this.getHttpMessage(statusCode);
      }
    } else {
      message = this.translate('common.INTERNAL_ERROR');
    }

    return {
      success: false,
      statusCode,
      errorCode,
      message,
      errors,
    };
  }

  private getHttpMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'common.BAD_REQUEST',
      401: 'common.UNAUTHORIZED',
      403: 'common.FORBIDDEN',
      404: 'common.NOT_FOUND',
      405: 'common.METHOD_NOT_ALLOWED',
      408: 'common.REQUEST_TIMEOUT',
      409: 'common.CONFLICT',
      413: 'common.PAYLOAD_TOO_LARGE',
      415: 'common.UNSUPPORTED_MEDIA_TYPE',
      422: 'common.UNPROCESSABLE_ENTITY',
      429: 'common.TOO_MANY_REQUESTS',
      500: 'common.INTERNAL_ERROR',
      502: 'common.BAD_GATEWAY',
      503: 'common.SERVICE_UNAVAILABLE',
      504: 'common.GATEWAY_TIMEOUT',
    };

    return this.translate(messages[statusCode] || 'common.INTERNAL_ERROR');
  }

  private translate(key: string): string {
    return this.i18n.t(key as never);
  }
}
