import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpExceptionFilter } from 'filters/http-exception.filter';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ResponseFormat } from 'shared/shared.modal';
import { StaticStrings } from 'shared/static.string';
@Injectable()
@UseFilters(HttpExceptionFilter)
export class ResponseInterceptor implements NestInterceptor {
  calculatePayloadSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      const payloadSize = Buffer.from(jsonString, 'utf-8')?.length;
      return payloadSize;
    } catch {
      return 0;
    }
  }

  formatErrorResponse(error: any): ResponseFormat {
    let responseFormat: ResponseFormat = {
      message: StaticStrings.ERR_RESPONSE_STATUS_FAIL,
      status: false,
      data: null,
      statusCode: error?.statusCode || 500,
      timestamp: new Date().toISOString(),
      error: {
        message: 'Internal Server Error',
        code: 500,
      },
      totalRecords: 0,
    };
    try {
      const isDevEnv = true;
      responseFormat = {
        message: StaticStrings.ERR_RESPONSE_STATUS_FAIL,
        status: false,
        data: null,
        statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        error: {
          message: error?.message || 'Internal Server Error',
          code:
            error.errorNum ||
            error?.statusCode ||
            HttpStatus.INTERNAL_SERVER_ERROR,
          stack: isDevEnv ? error?.stack : null,
          //...(isDevEnv && { stack: error?.stack ?? null }),
          path: error?.path,
        },
        totalRecords: 0,
      };
      return responseFormat;
    } catch (e) {
      return responseFormat;
    }
  }

  getValidatedAndFormattedData(data: any) {
    return data;
  }

  getRecordsCount(data: any): number {
    if (data) {
      if (data.hasOwnProperty('records')) {
        return data['records'].length;
      } else {
        return data.length;
      }
    } else {
      return 0;
    }
  }

  formatSuccessResponse(data: any): ResponseFormat {
    const responseFormat: ResponseFormat = {
      message: data
        ? StaticStrings.INFO_RESPONSE_STATUS_SUCCESS
        : StaticStrings.ERR_RECORDS_NOT_FOUND,
      status: true,
      data: data.data
        ? this.getValidatedAndFormattedData(data.data)
        : this.getValidatedAndFormattedData(data),
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      error: null,
      totalRecords: this.getRecordsCount(data),
    };
    return responseFormat;
  }

  getCachedResponse(url: string): any {
    //This is just a code for template
    console.log(url);
    //return url;
  }

  cacheResponse(url: string, data: any): void {
    //This is just a code for template
    console.log(url);
    console.log(data);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest();

    //Check if response is already cached
    const cachedResponse = this.getCachedResponse(request.url);
    if (cachedResponse) return of(cachedResponse);

    return next.handle().pipe(
      tap((data) => {
        this.cacheResponse(request.url, data);
      }),
      map((data) => {
          if (data?.data?.success === false) {
            // Manually throw an error to handle in the error flow
            throw new HttpException(
              {
                success: false,
                message: data.data.message || 'An error occurred',
                data: null,
                errors: data.errors || [],
              },
              400,
            );
          }
        const response: ResponseFormat = this.formatSuccessResponse(data);
        return response;
      }),
      catchError((error) => {
        if (error instanceof HttpException) {
          return new Observable<never>((observer) => {
            const responseFormat = this.formatErrorResponse(error);
            response?.status(responseFormat.statusCode).json(responseFormat);
            observer.error(error);
          });
        } else {
          return new Observable<never>((observer) => {
            const responseFormat = this.formatErrorResponse({
              message: error?.message,
              code: error?.errorNum ?? error?.code,
              path: request?.url,
              stack: error?.stack || '',
            });
            response?.status(responseFormat.statusCode).json(responseFormat);
            observer.error(responseFormat);
          });
        }

        //const responseFormat = this.format
        // const statusCode =
        //   error instanceof HttpException
        //     ? error?.getStatus()
        //     : HttpStatus?.INTERNAL_SERVER_ERROR;

        // const response: ResponseFormat = {
        //   status: false,
        //   statusCode: statusCode,
        //   error: {
        //     message: error?.message || 'Internal server error!!',
        //     code: statusCode,
        //   },
        //   data: null,
        //   timestamp: new Date().toISOString(),
        // };

        // return new Observable<never>((observer) => {
        //   observer.error(error);
        // });
      }),
    );
  }
}
