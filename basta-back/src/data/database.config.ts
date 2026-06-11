import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default function databaseConnection(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    autoLoadEntities: true,
  };
}
