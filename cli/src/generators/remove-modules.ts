import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { getFilesToRemove, getNpmPackagesToRemove } from '../modules/module-mapper';
import { logInfo, logWarning } from '../utils/logger';

export async function removeUnselectedModules(
  projectPath: string,
  selectedModules: string[]
): Promise<void> {
  logInfo('Removing unselected modules...');

  // 1. Remove files
  await removeFiles(projectPath, selectedModules);

  // 2. Remove NPM packages
  await removeNpmPackages(projectPath, selectedModules);

  // 3. Clean broken imports (optional, can be skipped for simplicity)
  // await cleanBrokenImports(projectPath);

  // 4. Remove empty directories
  await removeEmptyDirectories(projectPath);
}

async function removeFiles(
  projectPath: string,
  selectedModules: string[]
): Promise<void> {
  const filesToRemove = getFilesToRemove(selectedModules);

  let removedCount = 0;

  for (const file of filesToRemove) {
    const filePath = path.join(projectPath, file);

    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    logInfo(`Removed ${removedCount} module-specific files`);
  }
}

async function removeNpmPackages(
  projectPath: string,
  selectedModules: string[]
): Promise<void> {
  const packagesToRemove = getNpmPackagesToRemove(selectedModules);

  if (packagesToRemove.length === 0) {
    return;
  }

  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  let removedCount = 0;

  for (const pkg of packagesToRemove) {
    if (packageJson.dependencies && packageJson.dependencies[pkg]) {
      delete packageJson.dependencies[pkg];
      removedCount++;
    }
  }

  if (removedCount > 0) {
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    logInfo(`Removed ${removedCount} unused npm packages from package.json`);
  }
}

async function removeEmptyDirectories(projectPath: string): Promise<void> {
  const allDirs = await glob('**/', {
    cwd: projectPath,
    ignore: ['node_modules/**', '.next/**', 'dist/**'],
    dot: false,
  });

  // Sort in reverse order to remove deepest directories first
  allDirs.sort((a, b) => b.split('/').length - a.split('/').length);

  let removedCount = 0;

  for (const dir of allDirs) {
    const dirPath = path.join(projectPath, dir);

    try {
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.remove(dirPath);
        removedCount++;
      }
    } catch (error) {
      // Directory might have been removed already
    }
  }

  if (removedCount > 0) {
    logInfo(`Removed ${removedCount} empty directories`);
  }
}

// Optional: Clean broken imports (complex, can be skipped)
async function cleanBrokenImports(projectPath: string): Promise<void> {
  logWarning('Skipping broken imports cleanup (manual cleanup may be needed)');
  // This would require parsing TypeScript AST, which is complex
  // For now, we skip this step and rely on the user to run lint/build
}
