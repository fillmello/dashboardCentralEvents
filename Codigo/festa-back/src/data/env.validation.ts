type EnvRecord = Record<string, unknown>;

const ALWAYS_REQUIRED = ['DATABASE_URL', 'JWT_SECRET'] as const;

const PRODUCTION_REQUIRED = ['CORS_ORIGIN'] as const;

export function validateEnv(env: EnvRecord): EnvRecord {
  const missing: string[] = [];
  const isProduction = env.NODE_ENV === 'production';

  for (const key of ALWAYS_REQUIRED) {
    if (!env[key]) missing.push(key);
  }

  if (isProduction) {
    for (const key of PRODUCTION_REQUIRED) {
      if (!env[key]) missing.push(key);
    }

    const jwtSecret = String(env.JWT_SECRET ?? '');
    if (jwtSecret && jwtSecret.length < 32) {
      throw new Error(
        `JWT_SECRET must be at least 32 characters in production (got ${jwtSecret.length}). Generate one with: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`,
      );
    }

    if (env.DB_SYNCHRONIZE === 'true') {
      console.warn(
        '[env] WARNING: DB_SYNCHRONIZE=true is set in production. Only use this for a one-shot first deploy, then remove it.',
      );
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}`,
    );
  }

  return env;
}
