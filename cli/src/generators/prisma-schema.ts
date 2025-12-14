import * as fs from 'fs-extra';
import * as path from 'path';
import { getPrismaModelsToRemove } from '../modules/module-mapper';
import { logInfo } from '../utils/logger';

export async function cleanPrismaSchema(
  projectPath: string,
  selectedModules: string[]
): Promise<void> {
  const schemaPath = path.join(projectPath, 'prisma/schema.prisma');

  if (!(await fs.pathExists(schemaPath))) {
    return;
  }

  const modelsToRemove = getPrismaModelsToRemove(selectedModules);

  if (modelsToRemove.length === 0) {
    return;
  }

  logInfo(`Cleaning Prisma schema (removing ${modelsToRemove.length} models/enums)...`);

  let schemaContent = await fs.readFile(schemaPath, 'utf-8');

  for (const modelName of modelsToRemove) {
    // Remove model definition
    const modelRegex = new RegExp(
      `model ${modelName}\\s*\\{[^}]*\\}\\s*`,
      'gs'
    );
    schemaContent = schemaContent.replace(modelRegex, '');

    // Remove enum definition
    const enumRegex = new RegExp(
      `enum ${modelName}\\s*\\{[^}]*\\}\\s*`,
      'gs'
    );
    schemaContent = schemaContent.replace(enumRegex, '');
  }

  // Clean broken relations (fields that reference removed models)
  schemaContent = cleanBrokenRelations(schemaContent, modelsToRemove);

  // Clean up multiple consecutive blank lines
  schemaContent = schemaContent.replace(/\n{3,}/g, '\n\n');

  await fs.writeFile(schemaPath, schemaContent, 'utf-8');
}

function cleanBrokenRelations(schema: string, removedModels: string[]): string {
  let cleaned = schema;

  for (const model of removedModels) {
    // Remove relation fields that reference the removed model
    // Split by lines to process each line individually
    const lines = cleaned.split('\n');
    const filteredLines = lines.filter(line => {
      // Check if this line contains a field that references the removed model
      // Pattern: "  fieldName  ModelName" or "  fieldName  ModelName[]" or "  fieldName  ModelName?"
      const fieldPattern = new RegExp(
        `^\\s+\\w+\\s+${model}(\\[\\]|\\?)?\\s`,
        ''
      );
      return !fieldPattern.test(line);
    });
    cleaned = filteredLines.join('\n');
  }

  return cleaned;
}
