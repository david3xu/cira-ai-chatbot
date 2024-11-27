import { ChatCompletionContentPart } from 'openai/resources/chat/completions';

export interface MessageInput {
  content: string;
  role: 'user' | 'assistant' | 'system';
  imageFile?: File;
  document?: DocumentReference;
}

export interface DocumentReference {
  id: string;
  text: string;
  title?: string;
  metadata?: Record<string, any>;
}

export interface MessageOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  customPrompt?: string;
} 