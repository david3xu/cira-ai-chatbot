import { Document, DocumentError, DocumentMetadata } from '@/lib/types/document';
import { processDocument, ProcessDocumentOptions } from './processDocument';
import { supabase } from '@/lib/supabase/client';
import { STORAGE_CONFIG, DOCUMENT_DEFAULTS } from '../config/constants';

interface DocumentUploadOptions {
  dominationField?: string;
  source?: string;
  author?: string;
  onProgress?: (fileName: string, progress: number, status: string) => void;
}

/**
 * Get the correct MIME type for a file
 */
function getMimeType(file: File, isMarkdown: boolean): string {
  if (isMarkdown) {
    return 'text/markdown';
  }
  if (file.type === 'application/pdf') {
    return 'application/pdf';
  }
  // Default to text/markdown for .md files
  if (file.name.toLowerCase().endsWith('.md')) {
    return 'text/markdown';
  }
  return file.type;
}

/**
 * Sanitizes a filename by removing special characters and spaces
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_'); // Replace multiple underscores with single
}

/**
 * Ensures the storage bucket exists, creates it if it doesn't
 */
async function ensureBucketExists(): Promise<void> {
  try {
    // Try to get the bucket first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw new DocumentError(
        'Failed to check storage bucket',
        'BUCKET_LIST_FAILED',
        500
      );
    }

    const documentsBucket = buckets?.find(bucket => bucket.name === STORAGE_CONFIG.BUCKET_NAME);
    
    if (!documentsBucket) {
      // Try to create the bucket
      const { error: createError } = await supabase.storage
        .createBucket(STORAGE_CONFIG.BUCKET_NAME, {
          public: true,
          fileSizeLimit: STORAGE_CONFIG.MAX_FILE_SIZE,
          allowedMimeTypes: ['text/markdown', 'application/pdf', 'text/plain']
        });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        // If bucket already exists but we don't have permission to see it
        if (createError.message.includes('already exists')) {
          return; // Proceed with upload anyway
        }
        throw new DocumentError(
          `Failed to create storage bucket: ${createError.message}`,
          'BUCKET_CREATION_FAILED',
          500
        );
      }
    }
  } catch (error) {
    if (error instanceof DocumentError) {
      throw error;
    }
    console.error('Unexpected error during bucket setup:', error);
    throw new DocumentError(
      'Failed to setup storage bucket',
      'BUCKET_SETUP_FAILED',
      500
    );
  }
}

/**
 * Creates a document record from an uploaded file
 */
export async function uploadDocument(
  file: File,
  options: DocumentUploadOptions = {}
): Promise<Document> {
  try {
    const { onProgress } = options;
    onProgress?.(file.name, 0, 'Validating file...');

    // Validate file type
    const isMarkdown = file.type === 'text/markdown' || file.name.toLowerCase().endsWith('.md');
    const isPdf = file.type === 'application/pdf';
    
    if (!isMarkdown && !isPdf) {
      throw new DocumentError(
        'Invalid file type. Only Markdown (.md) and PDF files are accepted.',
        'INVALID_FILE_TYPE',
        400
      );
    }

    onProgress?.(file.name, 10, 'Checking file size...');

    // Validate file size
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      throw new DocumentError(
        `File size exceeds maximum limit of ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
        'FILE_TOO_LARGE',
        400
      );
    }

    onProgress?.(file.name, 20, 'Preparing storage...');

    // Ensure bucket exists
    await ensureBucketExists();

    onProgress?.(file.name, 30, 'Uploading file...');

    // Upload file to storage
    const timestamp = new Date().getTime();
    const sanitizedName = sanitizeFileName(file.name);
    const path = `${options.dominationField || DOCUMENT_DEFAULTS.DOMINATION_FIELD}/${timestamp}_${sanitizedName}`;
    
    // Create a new Blob with the correct MIME type
    const contentType = getMimeType(file, isMarkdown);
    const fileBlob = new Blob([await file.arrayBuffer()], { type: contentType });
    
    const { error: uploadError, data } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(path, fileBlob, {
        upsert: false,
        contentType: contentType
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new DocumentError(
        `Failed to upload file: ${uploadError.message}`,
        'UPLOAD_FAILED',
        500
      );
    }

    onProgress?.(file.name, 50, 'Processing content...');

    // Get the public URL
    const { data: { publicUrl: url } } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(path);

    onProgress?.(file.name, 60, 'Generating embeddings...');

    // Process the document
    const processOptions: ProcessDocumentOptions = {
      contentType: isPdf ? 'pdf' : 'markdown',
      metadata: {
        type: contentType,
        size: file.size,
        processedAt: new Date().toISOString(),
        author: options.author || DOCUMENT_DEFAULTS.AUTHOR,
        source: options.source || DOCUMENT_DEFAULTS.SOURCE,
        dominationField: options.dominationField || DOCUMENT_DEFAULTS.DOMINATION_FIELD,
        url,
        path
      }
    };

    onProgress?.(file.name, 80, 'Saving document...');
    const result = await processDocument(file, processOptions);
    onProgress?.(file.name, 100, 'Complete');
    return result;

  } catch (error) {
    console.error('Document upload error:', error);
    if (error instanceof DocumentError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new DocumentError(
        error.message,
        'UPLOAD_FAILED',
        500
      );
    }
    throw new DocumentError(
      'Failed to upload document',
      'UPLOAD_FAILED',
      500
    );
  }
}

export async function uploadMultipleDocuments(
  files: File[],
  options?: DocumentUploadOptions
): Promise<Document[]> {
  return Promise.all(files.map(file => uploadDocument(file, options)));
} 