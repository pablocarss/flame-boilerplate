import * as fs from 'fs-extra';
import * as path from 'path';

export async function replacePlaceholders(
  projectPath: string,
  replacements: Record<string, string>
): Promise<void> {
  const filesToProcess = ['package.json', 'README.md'];

  for (const file of filesToProcess) {
    const filePath = path.join(projectPath, file);

    if (await fs.pathExists(filePath)) {
      let content = await fs.readFile(filePath, 'utf-8');

      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'g');
        content = content.replace(regex, value);
      }

      await fs.writeFile(filePath, content, 'utf-8');
    }
  }
}
