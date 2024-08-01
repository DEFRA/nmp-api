import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorFormat } from '../shared/shared.modal';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorFormat: ErrorFormat = {
      code: status,
      message: exception?.message,
      path: request.url,
      stack: exception?.stack,
    };
    response.status(status).json(errorFormat);
  }
}
