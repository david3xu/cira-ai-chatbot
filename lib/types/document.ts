export type DocumentStatus = 'processing' | 'completed' | 'failed';
export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface DocumentMetadata {
  type: string;
  size: number;
  author: string;
  source: string;
  dominationField: string;
  processedAt: string;
  wordCount?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  url?: string;
  path?: string;
}

export interface Document {
  id: string;
  title?: string;
  content: string;
  url?: string;
  metadata: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
  status: DocumentStatus;
  error?: string;
  contentType: string;
}

export interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: Error | null;
  processingStatus: ProcessingStatus;
  uploadProgress: number;
}

export type DocumentAction = 
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'SET_CURRENT_DOCUMENT'; payload: Document | null }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Partial<Document> & { id: string } }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_PROCESSING_STATUS'; payload: ProcessingStatus }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number };

export class DocumentError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'DocumentError';
  }
}
