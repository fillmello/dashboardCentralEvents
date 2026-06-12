import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        // Routes that set a non-JSON Content-Type (e.g. CSV export) stream their
        // payload as-is instead of being wrapped in the standard envelope.
        const contentType = response.getHeader?.('Content-Type');
        if (typeof contentType === 'string' && !contentType.includes('json')) {
          return data;
        }
        return { success: true, data: data ?? null };
      }),
    );
  }
}
