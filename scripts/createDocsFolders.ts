import fs from 'fs/promises';
import path from 'path';
import { dominationFieldsData } from '../lib/data/domFields';

async function createDocsFolders() {
  const docsPath = path.join(process.cwd(), 'docs');
  
  try {
    await fs.access(docsPath);
    console.log('✓ Main docs folder exists');
  } catch {
    await fs.mkdir(docsPath);
    console.log('✓ Created main docs folder');
  }

  // Create subfolders for each domination field
  for (const field of dominationFieldsData) {
    const fieldPath = path.join(docsPath, field.value);
    try {
      await fs.access(fieldPath);
      console.log(`✓ Subfolder exists: ${field.value}`);
    } catch {
      await fs.mkdir(fieldPath);
      
      // Create a placeholder README in each folder
      const readmePath = path.join(fieldPath, 'README.md');
      const readmeContent = `# ${field.value} Documentation\n\nPlace your ${field.value} related documentation files in this folder.\n`;
      await fs.writeFile(readmePath, readmeContent);
      
      console.log(`✓ Created subfolder and README: ${field.value}`);
    }
  }

  console.log('\n✓ Folder structure creation completed!');
}

// Execute if run directly
if (require.main === module) {
  createDocsFolders().catch(console.error);
}

export { createDocsFolders }; 
createDocsFolders().catch(console.error); 