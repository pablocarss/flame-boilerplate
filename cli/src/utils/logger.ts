import chalk from 'chalk';

export function logInfo(message: string) {
  console.log(chalk.blue('ℹ'), message);
}

export function logSuccess(message: string) {
  console.log(chalk.green('✓'), message);
}

export function logWarning(message: string) {
  console.log(chalk.yellow('⚠'), message);
}

export function logError(message: string, error?: Error) {
  console.error(chalk.red('✗ ERROR:'), message);

  if (error) {
    console.error(chalk.gray('\nDetails:'));
    console.error(chalk.gray(error.message));

    if (process.env.DEBUG) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack || 'No stack trace available'));
    }
  }

  if (!process.env.DEBUG) {
    console.error(chalk.yellow('\nTip: Run with DEBUG=1 for more details'));
  }
}

export function logStep(step: number, total: number, message: string) {
  console.log(chalk.cyan(`\n[${step}/${total}]`), message);
}

export function displayBanner() {
  console.log(chalk.cyan.bold('\n  ╔═══════════════════════════════════╗'));
  console.log(chalk.cyan.bold('  ║   Flame Boilerplate Generator   ║'));
  console.log(chalk.cyan.bold('  ╚═══════════════════════════════════╝\n'));
}

export function displaySuccessMessage(config: {
  projectName: string;
  modules: string[];
  packageManager: string;
  dbPort: number;
  redisPort?: number;
  projectPath: string;
}) {
  console.log(chalk.green.bold('\n  ✓ SUCCESS! Project created.\n'));

  console.log(chalk.cyan('  Project details:'));
  console.log(`    ${chalk.gray('Name:')} ${chalk.white(config.projectName)}`);
  console.log(`    ${chalk.gray('Location:')} ${chalk.white(config.projectPath)}`);
  console.log(`    ${chalk.gray('Modules:')} ${chalk.white(config.modules.join(', ') || 'none')}`);
  console.log(`    ${chalk.gray('Package manager:')} ${chalk.white(config.packageManager)}`);

  console.log(chalk.cyan('\n  Services running:'));
  console.log(`    ${chalk.gray('PostgreSQL:')} ${chalk.white(`localhost:${config.dbPort}`)}`);
  if (config.redisPort) {
    console.log(`    ${chalk.gray('Redis:')} ${chalk.white(`localhost:${config.redisPort}`)}`);
  }
  if (config.modules.includes('storage')) {
    console.log(`    ${chalk.gray('MinIO:')} ${chalk.white('localhost:9000')}`);
    console.log(`    ${chalk.gray('MinIO Console:')} ${chalk.white('localhost:9001')}`);
  }
  console.log(`    ${chalk.gray('MailHog:')} ${chalk.white('localhost:8025')}`);

  console.log(chalk.cyan('\n  Next steps:\n'));
  console.log(chalk.white(`    cd ${config.projectPath}`));
  console.log(chalk.white(`    ${config.packageManager} dev`));

  if (config.modules.includes('billing')) {
    console.log(chalk.yellow('\n  ⚠ IMPORTANT: Configure Stripe keys in .env'));
  }

  console.log(chalk.cyan('\n  Documentation:'));
  console.log(`    ${chalk.white(`${config.projectPath}/README.md`)}`);

  console.log('\n');
}
