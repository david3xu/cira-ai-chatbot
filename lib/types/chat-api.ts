import { Chat, ChatMessage } from './chat';

export interface SendMessageParams {
  chatId: string;
  userContent: string;
  userRole: string;
  assistantRole: string;
  model: string;
  dominationField: string;
  messagePairId: string;
  files?: File[];
  customPrompt?: string | null;
}

export interface CreateNewChatParams {
  id?: string;
  model: string;
  dominationField: string;
  source: 'sidebar' | 'input';
  customPrompt?: string | undefined;
  name: string | null;
  metadata: Record<string, any> | null;
  chatId?: string;
}

export interface TransactionResponse {
  success: boolean;
  data?: {
    transactionId: string;
    chatId?: string;
  };
  error?: string;
  detail?: string;
}

export interface ChatStorageResponse {
  success: boolean;
  error: string | null;
  data: {
    id: string;
    chat_id: string;
    user_content: string;
    created_at: string;
    updated_at: string;
    model: string;
    domination_field: string;
    custom_prompt: string;
    metadata?: any;
  } | Chat[] | null;
}

export interface MessageRequest {
  chatId: string;
  content: string;
  model: string;
  dominationField: string;
  customPrompt?: string;
  messagePairId?: string;
  status?: 'sending' | 'streaming' | 'success' | 'failed';
}

export interface MessageResponse {
  id: string;
  chatId: string;
  messagePairId: string;
  userContent: string | null;
  assistantContent: string | null;
  userRole: 'user' | 'system';
  assistantRole: 'assistant';
  status: 'sending' | 'streaming' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ChatStreamOptions {
  model: string;
  dominationField: string;
  messagePairId: string;
  chatId: string;
  onMessage?: (message: ChatMessage | string) => void;
  onError?: (error: Error) => void;
}

export type APIAction = 
  | { type: 'START_REQUEST'; payload: string }
  | { type: 'END_REQUEST'; payload: string }
  | { type: 'SET_STREAMING_STATUS'; payload: 'idle' | 'streaming' | 'complete' }; 