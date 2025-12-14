import { execa } from 'execa';
import validateNpmPackageName from 'validate-npm-package-name';
import chalk from 'chalk';
import { logError } from './logger';

export async function validateEnvironment(): Promise<boolean> {
  const errors: string[] = [];

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    errors.push(`Node.js 18+ required. Current: ${nodeVersion}`);
  }

  // Check Docker
  try {
    await execa('docker', ['--version']);
  } catch {
    errors.push('Docker is not installed or not in PATH');
  }

  // Check Docker Compose
  try {
    await execa('docker-compose', ['--version']);
  } catch {
    try {
      // Try docker compose (newer version)
      await execa('docker', ['compose', 'version']);
    } catch {
      errors.push('Docker Compose is not installed or not in PATH');
    }
  }

  if (errors.length > 0) {
    console.error(chalk.red('\n✗ Environment validation failed:\n'));
    errors.forEach((e) => console.error(chalk.red(`  - ${e}`)));
    console.error(chalk.yellow('\nPlease install missing dependencies and try again.\n'));
    return false;
  }

  return true;
}

export function validateProjectName(name: string): boolean {
  const validation = validateNpmPackageName(name);

  if (!validation.validForNewPackages) {
    console.error(chalk.red('\n✗ Invalid project name:\n'));
    validation.errors?.forEach((e) => console.error(chalk.red(`  - ${e}`)));
    validation.warnings?.forEach((w) => console.error(chalk.yellow(`  - ${w}`)));
    console.error(chalk.yellow('\nProject name must be a valid npm package name.\n'));
    return false;
  }

  return true;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
