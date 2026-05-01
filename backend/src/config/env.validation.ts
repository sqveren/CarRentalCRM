type Environment = {
  DATABASE_URL: string;
  PORT?: string;
  FRONTEND_URL?: string;
  NODE_ENV?: string;
  AUTH_SECRET?: string;
};

export function validateEnvironment(config: Record<string, unknown>): Environment {
  const env = config as Environment;

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  return {
    DATABASE_URL: env.DATABASE_URL,
    PORT: env.PORT ?? '3001',
    FRONTEND_URL: env.FRONTEND_URL ?? 'http://localhost:5173',
    NODE_ENV: env.NODE_ENV ?? 'development',
    AUTH_SECRET: env.AUTH_SECRET ?? 'local-dev-secret',
  };
}
