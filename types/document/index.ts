export interface DocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  pageCount?: number;
  previewUrl?: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedDocument {
  id: string;
  contentType: 'pdf' | 'image' | 'markdown' | 'doc' | string;
  text: string;
  metadata: DocumentMetadata;
  embedding?: number[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface DocumentProcessingOptions {
  generateEmbeddings?: boolean;
  chunkSize?: number;
  overlap?: number;
  includeMetadata?: boolean;
} 