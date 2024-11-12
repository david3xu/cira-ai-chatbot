export interface ProcessingProgress {
  overall: number;
  fileProgress: number;
  stage: string;
}

export interface ProcessedDocument {
  contentType: 'pdf' | 'image' | 'markdown' | 'doc' | string;
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pageCount?: number;
    previewUrl?: string;
  };
}

export interface ProcessingResult {
  success: boolean;
  error?: string;
  message?: string;
  reminder?: string;
  document?: ProcessedDocument;
}

export interface FileProcessingOptions {
  file: File;
  source: string;
  author: string;
  dominationField: string;
  abortSignal: AbortSignal;
  onProgress?: (progress: { overall: number }) => void;
} 