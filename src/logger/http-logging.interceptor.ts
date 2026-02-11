import { Injectable, NestInterceptor, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(context: ExecutionContext, next): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, params, body } = request;

    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    this.logger.log(
      `[${requestId}] 📨 ${method} ${url} - Query: ${JSON.stringify(query || {})} - Params: ${JSON.stringify(
        params || {},
      )}`,
    );

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`[${requestId}] 📦 Request Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logger.log(`[${requestId}] ✅ ${method} ${url} - ${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `[${requestId}] ❌ ${method} ${url} - ${duration}ms - Error: ${error.message}`,
          error.stack,
        );
        throw error;
      }),
    );
  }
}
