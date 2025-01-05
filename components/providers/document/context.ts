import { createContext } from 'react';
import type { Document, DocumentState } from '@/lib/types/document';

interface DocumentContextValue {
  state: DocumentState;
  actions: {
    setDocuments: (documents: Document[]) => void;
    setCurrentDocument: (document: Document | null) => void;
    addDocument: (document: Document) => void;
    updateDocument: (document: Partial<Document> & { id: string }) => void;
    removeDocument: (documentId: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: Error | null) => void;
    setProcessingStatus: (status: 'idle' | 'processing' | 'complete' | 'error') => void;
    setUploadProgress: (progress: number) => void;
  };
  hasDocuments: boolean;
  isProcessing: boolean;
  hasError: boolean;
  uploadComplete: boolean;
}

export const DocumentContext = createContext<DocumentContextValue | undefined>(undefined); 