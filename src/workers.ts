/**
 * Workers Entry Point
 *
 * Este arquivo inicia todos os workers em um processo separado.
 *
 * Uso:
 * ```bash
 * # Development
 * npm run workers
 *
 * # Production (PM2)
 * pm2 start src/workers.ts --name workers
 *
 * # Production (Node)
 * node dist/workers.js
 * ```
 */

import { startWorkers } from './infrastructure/jobs';

console.log('==========================================');
console.log('  Flame Boilerplate - Background Workers');
console.log('==========================================');
console.log('');

// Verificar variáveis de ambiente
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

console.log(`[Config] Redis: ${redisHost}:${redisPort}`);
console.log(`[Config] Node Environment: ${process.env.NODE_ENV || 'development'}`);
console.log('');

// Iniciar workers
startWorkers();

console.log('');
console.log('Workers are running. Press CTRL+C to stop.');
console.log('==========================================');
