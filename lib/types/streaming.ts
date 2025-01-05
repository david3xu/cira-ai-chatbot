import { MessageStatus } from './chat-message';

export interface StreamProgress {
  percentage: number;
  bytes: number;
  total?: number;
}

export interface StreamingOptions {
  stream?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  messagePairId?: string;
  abortSignal?: AbortSignal;
  dominationField?: string;
  metadata?: Record<string, any>;
}

export interface StreamCallbacks {
  onStart?: () => void;
  onMessage?: (chunk: string) => void;
  onProgress?: (progress: StreamProgress) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
  onAbort?: () => void;
}

export interface StreamResponse {
  id: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  metadata?: {
    model?: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    finishReason?: 'stop' | 'length' | 'cancelled';
  };
}

export interface StreamError {
  code: string;
  message: string;
  details?: unknown;
}

export type StreamEvent = 
  | { type: 'start' }
  | { type: 'message'; content: string }
  | { type: 'progress'; progress: StreamProgress }
  | { type: 'complete'; response: StreamResponse }
  | { type: 'error'; error: StreamError }
  | { type: 'abort' }; 