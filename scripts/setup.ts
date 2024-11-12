import fs from 'fs-extra';
import path from 'path';
import { dominationFieldsData } from '../lib/data/domFields';

async function setup() {
  console.log('🚀 Starting project setup...\n');

  const docsPath = path.join(process.cwd(), 'docs');
  
  try {
    // Ensure docs directory exists
    await fs.ensureDir(docsPath);
    console.log('✓ Main docs folder created/verified');

    // Get current subfolders
    const existingFolders = await fs.readdir(docsPath, { withFileTypes: true });
    const validFolderNames = new Set(dominationFieldsData.map(field => field.value));

    // Delete folders that don't match current domination fields
    for (const folder of existingFolders) {
      if (folder.isDirectory() && !validFolderNames.has(folder.name)) {
        const folderPath = path.join(docsPath, folder.name);
        await fs.remove(folderPath);
        console.log(`✓ Removed outdated folder: ${folder.name}`);
      }
    }

    // Create/verify subfolders for each domination field
    for (const field of dominationFieldsData) {
      const fieldPath = path.join(docsPath, field.value);
      await fs.ensureDir(fieldPath);
      
      // Create/update README for each subfolder
      const readmePath = path.join(fieldPath, 'README.md');
      const readmeContent = `# ${field.value} Documentation\n\nPlace your ${field.value} related documentation files in this folder.\n`;
      await fs.writeFile(readmePath, readmeContent);
      
      console.log(`✓ Created/verified subfolder and README: ${field.value}`);
    }

    console.log('\n✅ Setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setup();
} 