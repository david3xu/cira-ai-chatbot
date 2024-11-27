import { createHash } from 'crypto';
import { getEmbedding } from '@/lib/features/ai/utils/embedding';

export interface UploadDocumentParams {
  file: File;
  content: string;
  metadata?: Record<string, any>;
}

export interface UploadDocumentResponse {
  id: string;
  filename: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export async function uploadDocument({
  file,
  content,
  metadata
}: UploadDocumentParams): Promise<UploadDocumentResponse> {
  try {
    // Generate document ID from content hash
    const hash = createHash('sha256');
    hash.update(content);
    const id = hash.digest('hex');

    // Generate embedding for the content
    const embedding = await getEmbedding(content);

    return {
      id,
      filename: file.name,
      content,
      embedding,
      metadata
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document');
  }
} 