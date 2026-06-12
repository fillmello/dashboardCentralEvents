import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Last-resort process guards: log and keep serving instead of letting a stray
// async error (e.g. an un-awaited DB call) terminate the process. Request-scoped
// errors are already handled by AllExceptionsFilter; this is the backstop.
const processLogger = new Logger('Process');
process.on('unhandledRejection', (reason) => {
  processLogger.error(
    `Unhandled promise rejection: ${
      reason instanceof Error ? (reason.stack ?? reason.message) : String(reason)
    }`,
  );
});
process.on('uncaughtException', (error) => {
  processLogger.error(`Uncaught exception: ${error.stack ?? error.message}`);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
