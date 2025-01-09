import { supabase } from '@/lib/supabase/client';
import { UploadedFile, UploadProgress } from '@/lib/types/state/uploadedFile';
import { DEFAULT_USER_ID } from '@/lib/features/ai/config/constants';

interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: UploadProgress) => void;
  dominationField?: string;
  source?: string;
  author?: string;
}

const DEFAULT_OPTIONS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/markdown'] as const,
  onProgress: () => {}
} as const;

function getContentType(mimeType: string, filename: string): 'pdf' | 'image' | 'markdown' {
  // Check by MIME type first
  if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'text/markdown' || filename.toLowerCase().endsWith('.md')) return 'markdown';
  throw new Error(`Unsupported file type: ${mimeType || filename}`);
}

/**
 * Validates a file before upload
 */
function validateFile(file: File, options: UploadOptions = {}): void {
  const { maxSize = DEFAULT_OPTIONS.maxSize, allowedTypes = DEFAULT_OPTIONS.allowedTypes } = options;

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  // Check for markdown files
  if (fileName.endsWith('.md') || fileType === 'text/markdown') {
    return;
  }
  
  // Check for other allowed types
  if (!allowedTypes.some(type => fileType === type)) {
    throw new Error(`File type not allowed. Allowed types: .md, .pdf`);
  }
}

/**
 * Uploads a file and creates a record in the files table
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadedFile> {
  try {
    // Validate file
    validateFile(file, options);

    // Upload to storage
    const timestamp = new Date().getTime();
    const path = `uploads/${options.dominationField || 'general'}/${timestamp}_${file.name}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('uploads')  // Using 'uploads' bucket instead of 'documents'
      .upload(path, file, {
        upsert: false,
        duplex: 'half'
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get the public URL
    const { data: { publicUrl: url } } = supabase.storage
      .from('uploads')  // Using 'uploads' bucket instead of 'documents'
      .getPublicUrl(path);

    // Track progress separately using XHR if needed
    if (options.onProgress) {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        options.onProgress?.({
          loaded: event.loaded,
          total: event.total,
          percentage: (event.loaded / event.total) * 100
        });
      };
      xhr.open('PUT', url);
      xhr.send(file);
    }

    // Create file record in database
    const { data: fileRecord, error: insertError } = await supabase
      .from('documents')  // Changed from 'files' to 'documents'
      .insert({
        title: file.name,
        content_type: getContentType(file.type, file.name),
        url,
        source: options.source || 'default',
        author: options.author || 'default',
        domination_field: options.dominationField || 'general',
        metadata: {
          contentType: getContentType(file.type, file.name),
          dominationField: options.dominationField || 'general',
          source: options.source || 'default',
          author: options.author || 'default',
          uploadedAt: new Date().toISOString(),
          size: file.size,
          path
        }
      })
      .select()
      .single();

    if (insertError) {
      // Clean up storage if database insert fails
      await supabase.storage.from('uploads').remove([path]);
      throw new Error(insertError.message);
    }

    return fileRecord;

  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Uploads multiple files
 */
export async function uploadMultipleFiles(
  files: FileList | File[],
  options?: UploadOptions
): Promise<UploadedFile[]> {
  const fileArray = Array.isArray(files) ? files : Array.from(files);
  return Promise.all(fileArray.map(file => uploadFile(file, options)));
} 