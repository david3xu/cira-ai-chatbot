import type { ModelConfig } from './model';
import type { StreamingOptions, StreamCallbacks } from './streaming';
import type { ChatMessage } from './chat-message';

export interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessDocumentOptions {
  contentType: 'pdf' | 'markdown' | 'image' | 'text';
  metadata?: Record<string, any>;
  encoding?: string;
  maxSize?: number;
}

export interface SearchOptions {
  field?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface AssistantMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: string;
}

export interface ChatOptions {
  title?: string;
  name?: string;
  model?: string;
  dominationField?: string;
  customPrompt?: string;
  modelConfig?: Partial<ModelConfig>;
}

export interface StreamOptions {
  model?: string;
  customPrompt?: string;
  dominationField?: string;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export interface ChatStreamOptions extends StreamingOptions, StreamCallbacks {
  customPrompt?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FormattedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'image';
}