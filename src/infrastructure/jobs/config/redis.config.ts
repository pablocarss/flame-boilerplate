import { RedisOptions } from 'ioredis';

/**
 * Configuração do Redis para BullMQ
 */
export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false, // Required for BullMQ
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

/**
 * Opções de conexão do Redis
 */
export const redisConnection = {
  connection: redisConfig,
};
