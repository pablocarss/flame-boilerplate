import { execa } from 'execa';
import ora from 'ora';
import { sleep } from '../utils/validation';

export interface DatabaseConfig {
  dbName: string;
  containerName: string;
}

export async function createDatabase(config: DatabaseConfig): Promise<void> {
  const spinner = ora('Creating PostgreSQL database...').start();

  try {
    // Wait for container to be ready
    await waitForPostgres(config.containerName, 60000);

    // Create database
    await execa('docker', [
      'exec',
      config.containerName,
      'psql',
      '-U',
      'postgres',
      '-c',
      `CREATE DATABASE "${config.dbName}";`,
    ]);

    spinner.succeed(`Database '${config.dbName}' created successfully`);
  } catch (error: any) {
    // Database already exists is OK
    if (error.stderr?.includes('already exists')) {
      spinner.succeed(`Database '${config.dbName}' already exists`);
    } else {
      spinner.fail('Failed to create database');
      throw error;
    }
  }
}

export async function runPrismaMigrations(
  projectPath: string,
  packageManager: 'pnpm' | 'npm' | 'yarn'
): Promise<void> {
  let spinner = ora('Generating Prisma Client...').start();

  try {
    // Generate Prisma Client
    await execa(packageManager, ['exec', 'prisma', 'generate'], {
      cwd: projectPath,
      stdio: 'pipe',
    });

    spinner.succeed('Prisma Client generated');

    // Push schema to database
    spinner = ora('Pushing database schema...').start();

    await execa(packageManager, ['exec', 'prisma', 'db', 'push', '--accept-data-loss'], {
      cwd: projectPath,
      stdio: 'pipe',
    });

    spinner.succeed('Database schema created successfully');
  } catch (error) {
    spinner.fail('Failed to setup database');
    throw error;
  }
}

async function waitForPostgres(
  containerName: string,
  timeoutMs: number
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const { stdout } = await execa('docker', [
        'inspect',
        '--format={{.State.Health.Status}}',
        containerName,
      ]);

      if (stdout.trim() === 'healthy') {
        return;
      }
    } catch (error) {
      // Container might not exist yet or doesn't have healthcheck
      // Try to connect via psql
      try {
        await execa('docker', [
          'exec',
          containerName,
          'pg_isready',
          '-U',
          'postgres',
        ]);
        return; // Connection successful
      } catch {
        // Not ready yet
      }
    }

    await sleep(2000);
  }

  throw new Error(
    `PostgreSQL container '${containerName}' did not become ready within timeout`
  );
}
