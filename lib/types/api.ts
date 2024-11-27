export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export interface ChatRequest {
  message: string;
  chatId: string;
  dominationField: string;
  model: string;
  customPrompt?: string;
  imageFile?: string;
  skipMessageStorage?: boolean;
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