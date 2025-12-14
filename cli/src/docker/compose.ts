import { execa } from 'execa';
import ora from 'ora';
import { sleep } from '../utils/validation';

export async function startDockerServices(projectPath: string): Promise<void> {
  const spinner = ora('Starting Docker services...').start();

  try {
    // Try docker-compose first (older version)
    try {
      await execa('docker-compose', ['up', '-d'], {
        cwd: projectPath,
        stdio: 'pipe',
      });
    } catch {
      // Try docker compose (newer version)
      await execa('docker', ['compose', 'up', '-d'], {
        cwd: projectPath,
        stdio: 'pipe',
      });
    }

    spinner.text = 'Waiting for services to be healthy...';

    // Wait for all services to be healthy
    await waitForAllHealthy(projectPath, 120000); // 2 min timeout

    spinner.succeed('All Docker services are running and healthy');
  } catch (error) {
    spinner.fail('Failed to start Docker services');
    throw error;
  }
}

export async function stopDockerServices(projectPath: string): Promise<void> {
  try {
    await execa('docker-compose', ['down', '-v'], {
      cwd: projectPath,
      stdio: 'pipe',
    });
  } catch {
    try {
      await execa('docker', ['compose', 'down', '-v'], {
        cwd: projectPath,
        stdio: 'pipe',
      });
    } catch {
      // Ignore errors during rollback
    }
  }
}

async function waitForAllHealthy(
  projectPath: string,
  timeoutMs: number
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      // Try docker-compose first
      let psOutput: string;
      try {
        const { stdout } = await execa('docker-compose', ['ps', '--format', 'json'], {
          cwd: projectPath,
        });
        psOutput = stdout;
      } catch {
        // Try docker compose
        const { stdout } = await execa('docker', ['compose', 'ps', '--format', 'json'], {
          cwd: projectPath,
        });
        psOutput = stdout;
      }

      // Parse JSON output (one JSON object per line)
      const lines = psOutput.trim().split('\n').filter(l => l.trim());

      if (lines.length === 0) {
        await sleep(2000);
        continue;
      }

      const services = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(s => s !== null);

      // Check if all services are healthy or running (some don't have healthchecks)
      const allHealthy = services.every((service: any) => {
        const health = service.Health || service.health;
        const state = service.State || service.state;

        // If service has healthcheck, it must be healthy
        if (health) {
          return health === 'healthy';
        }

        // Otherwise, it must be running
        return state === 'running';
      });

      if (allHealthy && services.length > 0) {
        return;
      }
    } catch (error) {
      // Services might not be up yet
    }

    await sleep(3000);
  }

  throw new Error('Services did not become healthy within the timeout period');
}
