import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const TIME_ZONE = process.env.TZ || 'America/Sao_Paulo';

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
    // Pin the Postgres session timezone so date_trunc/::date/now() on timestamptz
    // columns resolve in app time, not the container's UTC default. Sourced from
    // the same TZ env that drives the Node process so both stay in sync.
    extra: {
      options: `-c timezone=${TIME_ZONE}`,
    },
  };
}
