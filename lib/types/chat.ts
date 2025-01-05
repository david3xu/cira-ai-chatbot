import { ChatTableRow, ChatMessageTableRow } from './database';

// Application interface extending the database type
export interface Chat {
  id: string;
  name: string | null;
  model: string | null;
  custom_prompt: string | null;
  domination_field: string;
  metadata: Record<string, any> | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  chatTopic?: string;
  historyLoaded?: boolean;
  source?: 'sidebar' | 'input';
  initialMessage?: string;
  title?: string;
  isPinned?: boolean;
  pinnedAt?: string;
  error?: Error;
}

// Application message interface
export interface ChatMessage {
  id: string;
  chatId: string;
  messagePairId: string;
  userContent: string;
  assistantContent: string;
  userRole: 'user' | 'system';
  assistantRole: 'assistant' | 'system';
  dominationField: string;
  model: string;
  status: 'sending' | 'streaming' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
  customPrompt?: string;
  metadata?: any;
  streaming?: {
    isActive: boolean;
    progress?: number;
    startedAt?: string;
    completedAt?: string;
    response?: any;
  };
}

export interface ChatUpdate {
  name?: string;
  title?: string;
  model?: string;
  custom_prompt?: string | null;
  domination_field?: string;
  metadata?: Record<string, any>;
}

export interface ChatStreamOptions {
  model?: string;
  messagePairId?: string;
  chatId?: string;
  dominationField?: string;
  customPrompt?: string | null;
  metadata?: Record<string, any>;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onChatUpdate?: (chat: Chat) => void;
}

export interface ChatOptions {
  model?: string;
  dominationField?: string;
  customPrompt?: string;
  name?: string;
  title?: string;
}

export interface ChatResponse {
  data: Chat;
}

export type NewMessagePayload = {
  message: ChatMessage;
};

// Import these types from their respective files instead of defining them here
export type { ChatAction } from './chat-action';
export type { ChatState } from './chat-state';
  