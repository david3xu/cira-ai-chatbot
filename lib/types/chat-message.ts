import { Chat, ChatMessage } from './chat';

// Core Message Types
export type MessageStatus = 'sending' | 'streaming' | 'success' | 'failed';

export interface ChatMessageDB {
  id: string;
  chat_id: string;
  message_pair_id: string;
  user_content: string | null;
  assistant_content: string | null;
  user_role: 'user' | 'system';
  assistant_role: 'assistant' | 'system';
  created_at: string;
  updated_at: string;
  domination_field: string;
  model: string;
  image_url?: string;
  chat_topic?: string;
  metadata?: Record<string, any>;
  custom_prompt?: string | undefined;
  status: 'sending' | 'streaming' | 'success' | 'failed';
}

export interface MessageOptions {
  model: string | null;
  dominationField: string;
  messagePairId?: string;
  customPrompt?: string | null;
  metadata?: Record<string, any>;
  status?: 'sending' | 'streaming' | 'success' | 'failed';
}

export interface AssistantMessageOptions {
  status: 'sending' | 'streaming' | 'success' | 'failed';
  model: string | null;
  isStreaming?: boolean;
  temporary?: boolean;
  customPrompt?: string | null;
}

export interface ChatMessageResponse {
  message: ChatMessage;
  chat: Chat;
  error?: string;
}

export type { ChatMessage }; 