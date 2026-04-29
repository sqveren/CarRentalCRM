import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError, PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError | PrismaClientValidationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof PrismaClientKnownRequestError) {
      const status = this.mapKnownErrorToStatus(exception);
      response.status(status).json({
        message: this.mapKnownErrorToMessage(exception),
        code: exception.code,
      });
      return;
    }

    this.logger.error(exception.message);
    response.status(HttpStatus.BAD_REQUEST).json({
      message: 'Invalid data sent to the database layer.',
    });
  }

  private mapKnownErrorToStatus(error: PrismaClientKnownRequestError): HttpStatus {
    switch (error.code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2003':
        return HttpStatus.BAD_REQUEST;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private mapKnownErrorToMessage(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'A record with the same unique value already exists.';
      case 'P2003':
        return 'A related record does not exist.';
      case 'P2025':
        return 'The requested record was not found.';
      default:
        return 'Database request failed.';
    }
  }
}
