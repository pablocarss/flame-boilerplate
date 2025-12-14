import inquirer from 'inquirer';
import chalk from 'chalk';

export interface ProjectConfig {
  projectName: string;
  description: string;
  modules: string[];
  packageManager: 'pnpm' | 'npm' | 'yarn';
  dbPort: number;
  redisPort: number;
  confirmed: boolean;
}

export async function runInteractiveSetup(
  projectName?: string
): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: projectName || 'my-flame-app',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Project name is required';
        }
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name must be lowercase alphanumeric with hyphens only';
        }
        if (input.length < 3) {
          return 'Project name must be at least 3 characters long';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description (optional):',
      default: '',
    },
    {
      type: 'checkbox',
      name: 'modules',
      message: 'Select modules to include (use SPACE to select, ENTER to continue):',
      choices: [
        {
          name: 'Leads/CRM - Kanban board, sales pipeline (with Redis)',
          value: 'leads',
          checked: true,
        },
        {
          name: 'Submissions - Forms and submissions management',
          value: 'submissions',
          checked: false,
        },
        {
          name: 'Billing/Stripe - Payments and subscriptions (requires API keys)',
          value: 'billing',
          checked: false,
        },
        {
          name: 'Storage/MinIO - S3-compatible file uploads (with MinIO)',
          value: 'storage',
          checked: false,
        },
      ],
      validate: (choices: string[]) => {
        // Allow empty selection
        return true;
      },
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: ['pnpm', 'npm', 'yarn'],
      default: 'pnpm',
    },
    {
      type: 'number',
      name: 'dbPort',
      message: 'PostgreSQL port:',
      default: 5432,
      validate: (input: number) => {
        if (input < 1024 || input > 65535) {
          return 'Port must be between 1024 and 65535';
        }
        return true;
      },
    },
    {
      type: 'number',
      name: 'redisPort',
      message: 'Redis port:',
      default: 6379,
      when: (answers) => answers.modules.includes('leads'),
      validate: (input: number) => {
        if (input < 1024 || input > 65535) {
          return 'Port must be between 1024 and 65535';
        }
        return true;
      },
    },
  ]);

  // Display summary
  console.log(chalk.cyan('\n' + '─'.repeat(50)));
  console.log(chalk.cyan.bold('\n  📋 Project Summary\n'));
  console.log(`  ${chalk.gray('Name:')} ${chalk.white(answers.projectName)}`);
  if (answers.description) {
    console.log(`  ${chalk.gray('Description:')} ${chalk.white(answers.description)}`);
  }

  // Show modules with details
  if (answers.modules.length > 0) {
    console.log(`\n  ${chalk.gray('Selected Modules:')}`);
    answers.modules.forEach((mod: string) => {
      const moduleNames: Record<string, string> = {
        leads: '  ✓ Leads/CRM (Kanban + Redis)',
        submissions: '  ✓ Submissions (Forms)',
        billing: '  ✓ Billing/Stripe (Payments)',
        storage: '  ✓ Storage/MinIO (S3 Files)',
      };
      console.log(chalk.green(moduleNames[mod] || `  ✓ ${mod}`));
    });
  } else {
    console.log(`\n  ${chalk.gray('Modules:')} ${chalk.yellow('None (base only)')}`);
  }

  console.log(`\n  ${chalk.gray('Package manager:')} ${chalk.white(answers.packageManager)}`);
  console.log(`  ${chalk.gray('PostgreSQL port:')} ${chalk.white(answers.dbPort)}`);
  if (answers.redisPort) {
    console.log(`  ${chalk.gray('Redis port:')} ${chalk.white(answers.redisPort)}`);
  }

  console.log(chalk.cyan('\n' + '─'.repeat(50) + '\n'));

  // Confirm
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: '⚡ Ready to create your project?',
      default: true,
    },
  ]);

  if (!confirmed) {
    console.log(chalk.yellow('\n✗ Project creation cancelled.\n'));
    process.exit(0);
  }

  return {
    ...answers,
    confirmed,
  } as ProjectConfig;
}
