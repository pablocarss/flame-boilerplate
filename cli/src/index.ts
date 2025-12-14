#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { execa } from 'execa';
import ora from 'ora';
import {
  displayBanner,
  displaySuccessMessage,
  logError,
  logStep,
  logWarning,
} from './utils/logger';
import { validateEnvironment, validateProjectName } from './utils/validation';
import { ProjectCreator } from './utils/rollback';
import { runInteractiveSetup } from './prompts';
import { copyBaseFiles } from './generators/copy-files';
import { removeUnselectedModules } from './generators/remove-modules';
import { cleanPrismaSchema } from './generators/prisma-schema';
import { generateDockerCompose } from './templates/docker-compose';
import { generateEnv } from './templates/env';
import { replacePlaceholders } from './templates/placeholders';
import { startDockerServices, stopDockerServices } from './docker/compose';
import { createDatabase, runPrismaMigrations } from './database/setup';

const program = new Command();

program
  .name('create-flame-app')
  .description('Create a new Flame Boilerplate project')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName?: string) => {
    try {
      displayBanner();

      // Step 1: Validate environment
      logStep(1, 10, 'Validating environment...');
      const isValid = await validateEnvironment();
      if (!isValid) {
        process.exit(1);
      }

      // Step 2: Run interactive prompts
      logStep(2, 10, 'Collecting project configuration...');
      const config = await runInteractiveSetup(projectName);

      if (!validateProjectName(config.projectName)) {
        process.exit(1);
      }

      // Step 3: Setup project creation with rollback support
      const creator = new ProjectCreator();
      const currentDir = process.cwd();

      // Resolve boilerplate directory (2 levels up from dist/)
      const boilerplateDir = path.resolve(__dirname, '../..');

      // If running from inside cli/, create project OUTSIDE boilerplate
      let projectPath: string;
      if (currentDir.endsWith('cli') || currentDir.includes(path.sep + 'cli' + path.sep)) {
        // Running from cli/ directory, create project 2 levels up (outside boilerplate)
        const outsideDir = path.resolve(currentDir, '../..');
        projectPath = path.join(outsideDir, config.projectName);
        logWarning(`Creating project outside boilerplate: ${outsideDir}`);
      } else {
        // Running from elsewhere, create in current directory
        projectPath = path.join(currentDir, config.projectName);
      }

      // Check if directory already exists
      if (await fs.pathExists(projectPath)) {
        logError(`Directory '${config.projectName}' already exists`);
        process.exit(1);
      }

      // Prevent creating inside boilerplate directory
      const relativePath = path.relative(boilerplateDir, projectPath);
      if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
        logError(
          `Cannot create project inside boilerplate directory.\n` +
          `Please run from outside: ${boilerplateDir}`
        );
        process.exit(1);
      }

      const dbName = `${config.projectName.replace(/-/g, '_')}_db`;
      const containerName = `${config.projectName}-postgres`;

      // Step 1: Create project directory
      logStep(3, 10, 'Creating project directory...');
      creator.addStep({
        name: 'Create project directory',
        execute: async () => {
          await fs.mkdir(projectPath);
        },
        rollback: async () => {
          await fs.remove(projectPath);
        },
      });

      // Step 2: Copy base files
      logStep(4, 10, 'Copying boilerplate files...');
      creator.addStep({
        name: 'Copy boilerplate files',
        execute: async () => {
          await copyBaseFiles(boilerplateDir, projectPath);
        },
        rollback: async () => {
          // Directory removal will handle this
        },
      });

      // Step 3: Remove unselected modules
      logStep(5, 10, 'Customizing modules...');
      creator.addStep({
        name: 'Remove unselected modules',
        execute: async () => {
          await removeUnselectedModules(projectPath, config.modules);
          await cleanPrismaSchema(projectPath, config.modules);
        },
        rollback: async () => {
          // No rollback needed
        },
      });

      // Step 4: Generate configuration files
      logStep(6, 10, 'Generating configuration files...');
      creator.addStep({
        name: 'Generate configuration files',
        execute: async () => {
          // Generate docker-compose.yml
          const dockerCompose = generateDockerCompose({
            projectName: config.projectName,
            dbName,
            dbPort: config.dbPort,
            redisPort: config.redisPort,
            selectedModules: config.modules,
          });

          await fs.writeFile(
            path.join(projectPath, 'docker-compose.yml'),
            dockerCompose,
            'utf-8'
          );

          // Generate .env
          const envContent = generateEnv({
            projectName: config.projectName,
            dbName,
            dbPort: config.dbPort,
            redisPort: config.redisPort,
            selectedModules: config.modules,
          });

          await fs.writeFile(path.join(projectPath, '.env'), envContent, 'utf-8');

          // Replace placeholders
          await replacePlaceholders(projectPath, {
            'flame-boilerplate': config.projectName,
            'Complete Next.js 14 boilerplate with authentication, payments, and more':
              config.description || `${config.projectName} - Built with Flame Boilerplate`,
            flame_db: dbName,
            'flame-uploads': `${config.projectName}-uploads`,
          });
        },
        rollback: async () => {
          // No rollback needed
        },
      });

      // Step 5: Start Docker services
      logStep(7, 10, 'Starting Docker services...');
      creator.addStep({
        name: 'Start Docker services',
        execute: async () => {
          await startDockerServices(projectPath);
        },
        rollback: async () => {
          await stopDockerServices(projectPath);
        },
      });

      // Step 6: Create database
      logStep(8, 10, 'Setting up database...');
      creator.addStep({
        name: 'Create database',
        execute: async () => {
          await createDatabase({
            dbName,
            containerName,
          });
        },
        rollback: async () => {
          // Database will be removed when docker-compose down is called
        },
      });

      // Step 7: Install dependencies
      logStep(9, 10, 'Installing dependencies...');
      creator.addStep({
        name: 'Install dependencies',
        execute: async () => {
          const spinner = ora(
            `Installing dependencies with ${config.packageManager}...`
          ).start();

          await execa(config.packageManager, ['install'], {
            cwd: projectPath,
            stdio: 'pipe',
          });

          spinner.succeed('Dependencies installed');
        },
        rollback: async () => {
          await fs.remove(path.join(projectPath, 'node_modules'));
        },
      });

      // Step 8: Run database migrations
      logStep(10, 10, 'Running database migrations...');
      creator.addStep({
        name: 'Run database migrations',
        execute: async () => {
          await runPrismaMigrations(projectPath, config.packageManager);
        },
        rollback: async () => {
          // No rollback needed
        },
      });

      // Execute all steps
      await creator.execute();

      // Display success message
      displaySuccessMessage({
        projectName: config.projectName,
        modules: config.modules,
        packageManager: config.packageManager,
        dbPort: config.dbPort,
        redisPort: config.redisPort,
        projectPath,
      });
    } catch (error) {
      logError('Failed to create project', error as Error);
      process.exit(1);
    }
  });

program.parse();
