export interface Document {
  id: string;
  title?: string;
  content: string;
  url?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  status?: 'processing' | 'completed' | 'failed';
  error?: string;
  contentType?: string;
}

export interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: Error | null;
  processingStatus: 'idle' | 'processing' | 'complete' | 'error';
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
  | { type: 'SET_PROCESSING_STATUS'; payload: 'idle' | 'processing' | 'complete' | 'error' }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number };
