import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface ErrorResponse {
  status: number;
  message: string | string[];
  data: null;
}

interface HttpExceptionBody {
  message?: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : undefined;

    const message = this.getMessage(exceptionResponse, exception, status);
    const body: ErrorResponse = { status, message, data: null };

    response.status(status).json(body);
  }

  private getMessage(
    exceptionResponse: string | object | undefined,
    exception: unknown,
    status: number,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (exceptionResponse && 'message' in exceptionResponse) {
      const { message } = exceptionResponse as HttpExceptionBody;
      if (typeof message === 'string' || Array.isArray(message)) {
        return message;
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Internal server error';
    }

    return exception instanceof Error ? exception.message : 'Request failed';
  }
}
