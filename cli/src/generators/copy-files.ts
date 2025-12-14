import * as fs from 'fs-extra';
import * as path from 'path';
import { logInfo } from '../utils/logger';

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  '.git',
  '.env',
  '.env.local',
  'cli',
  'test-project',
  'postgres_data',
  'redis_data',
  'minio_data',
];

/**
 * Copy boilerplate files from source to target directory
 *
 * TODO: Future improvement - Clone from Git repository instead of local copy
 * When published to npm, this should:
 * 1. Clone from GitHub: https://github.com/your-org/flame-boilerplate
 * 2. Use specific branch/tag (e.g., 'main' or 'v1.0.0')
 * 3. Remove .git directory after cloning
 *
 * Example implementation:
 * ```typescript
 * import { execa } from 'execa';
 *
 * const REPO_URL = 'https://github.com/your-org/flame-boilerplate';
 * const BRANCH = 'main';
 *
 * await execa('git', ['clone', '--depth', '1', '--branch', BRANCH, REPO_URL, targetDir]);
 * await fs.remove(path.join(targetDir, '.git'));
 * ```
 */
export async function copyBaseFiles(
  sourceDir: string,
  targetDir: string
): Promise<void> {
  logInfo(`Copying boilerplate files from ${path.basename(sourceDir)}...`);

  await fs.copy(sourceDir, targetDir, {
    filter: (src: string) => {
      const relativePath = path.relative(sourceDir, src);

      // Skip excluded patterns
      for (const pattern of EXCLUDE_PATTERNS) {
        if (relativePath.startsWith(pattern)) {
          return false;
        }
      }

      return true;
    },
  });

  // Copy .env.example to .env
  const envExamplePath = path.join(targetDir, '.env.example');
  const envPath = path.join(targetDir, '.env');

  if (await fs.pathExists(envExamplePath)) {
    await fs.copy(envExamplePath, envPath);
  }
}
