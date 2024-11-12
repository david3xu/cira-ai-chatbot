import fs from 'fs/promises';
import path from 'path';
import { dominationFieldsData } from '@/lib/data/domFields';

export async function ensureDocsFolders() {
  const docsPath = path.join(process.cwd(), 'docs');
  
  // Ensure main docs directory exists
  try {
    await fs.access(docsPath);
  } catch {
    await fs.mkdir(docsPath);
  }

  // Create subfolders for each domination field
  for (const field of dominationFieldsData) {
    const fieldPath = path.join(docsPath, field.value);
    try {
      await fs.access(fieldPath);
    } catch {
      await fs.mkdir(fieldPath);
    }
  }
}

export function getDocsFolderPath(dominationField: string) {
  return path.join(process.cwd(), 'docs', dominationField);
} 