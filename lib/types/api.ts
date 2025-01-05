/**
 * API Types
 * 
 * Type definitions for API interactions:
 * - Request/Response types
 * - Chat operations
 * - Model updates
 * - Document handling
 * 
 * Features:
 * - Type safety
 * - Error handling
 * - Response formatting
 * - Request validation
 */

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: 'success' | 'error';
}

export interface ModelUpdateRequest {
  chatId?: string;
  model: string;
}

export interface EmbeddingRequest {
  input: string;
  model?: string;
}

export interface UploadMarkdownRequest {
  fileContent: string;
  source: string;
  author: string;
  fileName: string;
  dominationField: string;
}

export interface OllamaRequest {
  prompt: string;
  model?: string;
}

export interface DocumentChatRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  dominationField: string;
  documentInfo: {
    content: string;
    type: string;
    fileName: string;
  };
  chatId: string;
} 