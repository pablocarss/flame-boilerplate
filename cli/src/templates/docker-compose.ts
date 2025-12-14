import * as yaml from 'yaml';
import { getDockerServicesNeeded } from '../modules/module-mapper';

export interface DockerComposeConfig {
  projectName: string;
  dbName: string;
  dbPort: number;
  redisPort: number;
  selectedModules: string[];
}

export function generateDockerCompose(config: DockerComposeConfig): string {
  const services = getDockerServicesNeeded(config.selectedModules);

  const composeServices: any = {};

  // PostgreSQL (always included)
  if (services.includes('postgres')) {
    composeServices.postgres = {
      image: 'postgres:16-alpine',
      container_name: `${config.projectName}-postgres`,
      restart: 'unless-stopped',
      environment: {
        POSTGRES_USER: 'postgres',
        POSTGRES_PASSWORD: 'postgres',
        POSTGRES_DB: config.dbName,
      },
      volumes: ['postgres_data:/var/lib/postgresql/data'],
      ports: [`${config.dbPort}:5432`],
      healthcheck: {
        test: ['CMD-SHELL', 'pg_isready -U postgres'],
        interval: '10s',
        timeout: '5s',
        retries: 5,
      },
    };
  }

  // Redis (for background jobs - included if leads module selected)
  if (services.includes('redis')) {
    composeServices.redis = {
      image: 'redis:7-alpine',
      container_name: `${config.projectName}-redis`,
      restart: 'unless-stopped',
      command: 'redis-server --appendonly yes',
      ports: [`${config.redisPort}:6379`],
      volumes: ['redis_data:/data'],
      healthcheck: {
        test: ['CMD', 'redis-cli', 'ping'],
        interval: '10s',
        timeout: '5s',
        retries: 5,
      },
    };
  }

  // MinIO (for file storage)
  if (services.includes('minio')) {
    composeServices.minio = {
      image: 'minio/minio:latest',
      container_name: `${config.projectName}-minio`,
      restart: 'unless-stopped',
      command: 'server /data --console-address ":9001"',
      environment: {
        MINIO_ROOT_USER: 'minioadmin',
        MINIO_ROOT_PASSWORD: 'minioadmin',
      },
      volumes: ['minio_data:/data'],
      ports: ['9000:9000', '9001:9001'],
      healthcheck: {
        test: ['CMD', 'mc', 'ready', 'local'],
        interval: '30s',
        timeout: '20s',
        retries: 3,
      },
    };
  }

  // MinIO setup (creates bucket)
  if (services.includes('minio-setup')) {
    composeServices['minio-setup'] = {
      image: 'minio/mc:latest',
      container_name: `${config.projectName}-minio-setup`,
      depends_on: {
        minio: { condition: 'service_healthy' },
      },
      entrypoint: [
        '/bin/sh',
        '-c',
        `mc alias set myminio http://minio:9000 minioadmin minioadmin; mc mb myminio/${config.projectName}-uploads --ignore-existing; mc anonymous set public myminio/${config.projectName}-uploads; exit 0;`,
      ],
    };
  }

  // MailHog (always included for email testing)
  if (services.includes('mailhog')) {
    composeServices.mailhog = {
      image: 'mailhog/mailhog:latest',
      container_name: `${config.projectName}-mailhog`,
      restart: 'unless-stopped',
      ports: ['1025:1025', '8025:8025'],
      healthcheck: {
        test: [
          'CMD',
          'wget',
          '--quiet',
          '--tries=1',
          '--spider',
          'http://localhost:8025',
        ],
        interval: '10s',
        timeout: '5s',
        retries: 5,
      },
    };
  }

  // Determine volumes needed
  const volumes: string[] = [];
  if (services.includes('postgres')) volumes.push('postgres_data');
  if (services.includes('redis')) volumes.push('redis_data');
  if (services.includes('minio')) volumes.push('minio_data');

  const compose = {
    version: '3.8',
    services: composeServices,
    volumes: volumes.reduce((acc, v) => ({ ...acc, [v]: null }), {}),
  };

  return yaml.stringify(compose, { lineWidth: 0 });
}
