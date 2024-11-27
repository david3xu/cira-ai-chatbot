export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  url: string;
  error?: string;
}

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  generatePreview?: boolean;
  processImmediately?: boolean;
} 