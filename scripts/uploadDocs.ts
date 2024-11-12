import { supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs/promises';
import { EmbeddingService } from '@/lib/services/embeddingService';
import { createHash } from '@/lib/utils/crypto';
import { PdfService } from '@/lib/services/pdfService';
import { ensureDocsFolders, getDocsFolderPath } from '@/lib/utils/folders';
import { dominationFieldsData } from '@/lib/data/domFields';
import { TextChunkingService, CHUNK_CONFIG } from '@/lib/services/textChunkingService';

// Allow configurable batch size through environment
const BATCH_SIZE = process.env.UPLOAD_BATCH_SIZE 
  ? parseInt(process.env.UPLOAD_BATCH_SIZE) 
  : 10;

interface ProgressInfo {
  currentFile: string;
  totalFiles: number;
  currentChunk: number;
  totalChunks: number;
  percentage: number;
}

interface UploadOptions {
  dominationField?: string;
  source?: string;
  author?: string;
  directoryPath?: string;
  onProgress?: (progress: ProgressInfo) => void;
  serverUrl?: string;
}

const checkServerAvailable = async (url: string) => {
  try {
    const response = await fetch(`${url}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};

function getTextChunks(text: string): string[] {
  return TextChunkingService.getChunks(text, {
    preserveFormatting: true,
    maxChunks: CHUNK_CONFIG.MAX_CHUNKS
  });
}

async function processFile(file: File, options: UploadOptions): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check server availability first
    if (options.serverUrl) {
      const isAvailable = await checkServerAvailable(options.serverUrl);
      if (!isAvailable) {
        throw new Error('API server is not available');
      }
    }

    // Existing duplicate check
    const { data, error } = await supabase
      .from('documents')
      .select('url')
      .eq('url', file.name)
      .eq('domination_field', options.dominationField)
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      return { 
        success: false, 
        error: `File "${file.name}" already exists in the ${options.dominationField} domain.` 
      };
    }

    let fileContent: string;
    
    if (file.type === 'application/pdf') {
      fileContent = await PdfService.convertToText(file, {
        preserveFormatting: true,
        debug: process.env.NODE_ENV === 'development'
      });
    } else {
      fileContent = await file.text();
    }

    const hash = await createHash(fileContent);
    const chunks = getTextChunks(fileContent);
    console.log('Chunks generated:', {
      totalChunks: chunks.length,
      sampleChunk: chunks[0]?.substring(0,100)
    });
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, Math.min(i + BATCH_SIZE, chunks.length));
      
      // Enhanced getEmbeddings call with retry options
      const embeddings = await EmbeddingService.getEmbeddings(batchChunks);
      console.log('Embeddings response:', {
        batchSize: batchChunks.length,
        embeddingsReceived: embeddings.length,
        sampleEmbedding: embeddings[0]?.slice(0,5) // Log first few dimensions
      });

      for (let j = 0; j < batchChunks.length; j++) {
        if (!embeddings[j]) continue;

        const { error } = await supabase
          .from('documents')
          .insert({
            source: options.source || 'direct-upload',
            source_id: `${hash}-${i + j}`,
            content: batchChunks[j],
            document_id: `${file.name}-part${i + j + 1}`,
            author: options.author || 'system',
            url: file.name,
            embedding: embeddings[j],
            domination_field: options.dominationField,
          });

        if (error) throw error;
      }

      // Enhanced progress reporting
      if (options.onProgress) {
        options.onProgress({
          currentFile: file.name,
          totalFiles: 1, // Updated by parent function
          currentChunk: i + BATCH_SIZE,
          totalChunks: chunks.length,
          percentage: ((i + BATCH_SIZE) / chunks.length) * 100
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function uploadDocsToSupabase(options: UploadOptions = {}) {
  try {
    await ensureDocsFolders();
    
    // If no specific domination field is provided, process all folders
    if (!options.dominationField) {
      console.log('Processing all domination field folders...');
      
      for (const field of dominationFieldsData) {
        const fieldPath = getDocsFolderPath(field.value);
        console.log(`\nProcessing ${field.value} folder...`);
        
        try {
          await processFolder(fieldPath, { ...options, dominationField: field.value });
        } catch (error) {
          console.error(`Error processing ${field.value} folder:`, error);
          // Continue with other folders even if one fails
        }
      }
      
      console.log('\nCompleted processing all folders');
      return;
    }
    
    // Process single folder if dominationField is specified
    const directoryPath = options.directoryPath || getDocsFolderPath(options.dominationField);
    await processFolder(directoryPath, options);
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

async function processFolder(directoryPath: string, options: UploadOptions) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const duplicates: string[] = [];
  const failures: string[] = [];
  const successes: string[] = [];
  
  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    
    if (entry.isDirectory()) {
      console.log(`Processing subfolder: ${entry.name}`);
      await processFolder(fullPath, options);
    } else if (
      entry.name.endsWith('.md') || 
      entry.name.toLowerCase().endsWith('.markdown') ||
      entry.name.toLowerCase().endsWith('.pdf')
    ) {
      console.log(`Processing file: ${entry.name}`);
      const content = await fs.readFile(fullPath);
      const file = new File([content], entry.name, { 
        type: entry.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'text/markdown' 
      });

      const result = await processFile(file, options);
      
      if (result.success) {
        successes.push(entry.name);
        console.log(`Successfully processed ${entry.name}`);
      } else if (result.error?.includes('already exists')) {
        duplicates.push(entry.name);
        console.log(`Skipped duplicate: ${entry.name}`);
      } else {
        failures.push(`${entry.name}: ${result.error}`);
        console.error(`Failed to process ${entry.name}: ${result.error}`);
      }
    }
  }

  // Summary message
  if (duplicates.length > 0) {
    console.log(`\nDuplicates found in ${options.dominationField}:`);
    duplicates.forEach(file => console.log(`- ${file}`));
  }
  
  if (failures.length > 0) {
    console.log(`\nFailed files:`);
    failures.forEach(failure => console.log(`- ${failure}`));
  }

  console.log(`\nSummary for ${path.basename(directoryPath)}:`);
  console.log(`- Successfully processed: ${successes.length} files`);
  console.log(`- Duplicates skipped: ${duplicates.length} files`);
  console.log(`- Failed: ${failures.length} files`);
}

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: UploadOptions = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      if (key === 'onProgress') {
        options.onProgress = (progress: ProgressInfo) => console.log(`Upload progress: ${progress.percentage}%`);
      } else {
        options[key as keyof Omit<UploadOptions, 'onProgress'>] = value;
      }
    }
  }

  uploadDocsToSupabase(options)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} 