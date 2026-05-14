export interface EnvVars {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  ADMIN_PROMOTE_SECRET: string;
  RABBITMQ_URL?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const portRaw = config.PORT ?? '3001';
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`PORT inválido: ${String(portRaw)}`);
  }

  const mongoUri = (config.MONGO_URI as string) ?? 'mongodb://localhost:27017/auth';
  const jwtSecret = config.JWT_SECRET as string | undefined;
  const adminSecret = config.ADMIN_PROMOTE_SECRET as string | undefined;
  const rabbitmqUrl = config.RABBITMQ_URL as string | undefined;

  if (!jwtSecret || jwtSecret.trim().length === 0) {
    throw new Error('JWT_SECRET es requerido');
  }
  if (!adminSecret || adminSecret.trim().length === 0) {
    throw new Error('ADMIN_PROMOTE_SECRET es requerido');
  }

  return {
    PORT: port,
    MONGO_URI: mongoUri,
    JWT_SECRET: jwtSecret,
    ADMIN_PROMOTE_SECRET: adminSecret,
    RABBITMQ_URL: rabbitmqUrl,
  };
}
