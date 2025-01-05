import { Document } from '@/lib/types/document';
import { processDocument, ProcessDocumentOptions } from './processDocument';

/**
 * Upload Document Action
 * 
 * Manages document uploads with:
 * - File validation
 * - Upload handling
 * - Processing coordination
 * 
 * Features:
 * - File type detection
 * - Size validation
 * - Progress tracking
 * - Error handling
 */

interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

const DEFAULT_OPTIONS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/markdown'],
  onProgress: () => {}
} as const;

export async function uploadDocument(
  file: File,
  options: UploadOptions = {}
): Promise<Document> {
  const { maxSize, allowedTypes, onProgress } = {
    ...DEFAULT_OPTIONS,
    ...options
  } as Required<UploadOptions>;

  try {
    // Validate file
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Upload file
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    // Determine content type and options
    const processOptions: ProcessDocumentOptions = {
      contentType: getContentType(file.type),
      metadata: {
        type: file.type,
        size: file.size
      }
    };

    // Process the uploaded document
    const processedDocument = await processDocument(file, processOptions);

    console.log('📄 Document uploaded and processed:', {
      id: processedDocument.id,
      name: processedDocument.name,
      status: processedDocument.status
    });

    return processedDocument;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

function getContentType(mimeType: string): 'pdf' | 'image' | 'markdown' {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'text/markdown') return 'markdown';
  throw new Error(`Unsupported MIME type: ${mimeType}`);
}

export async function uploadMultipleDocuments(
  files: File[],
  options?: UploadOptions
): Promise<Document[]> {
  return Promise.all(files.map(file => uploadDocument(file, options)));
} 