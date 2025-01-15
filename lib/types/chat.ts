import { ChatAction } from './chat-action';

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
  userContent: string | MessageContent[];
  assistantContent: string;
  userRole: 'user' | 'system';
  assistantRole: 'assistant' | 'system';
  dominationField: string;
  model: string;
  status: 'sending' | 'streaming' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
  customPrompt?: string | null;
  metadata?: {
    attachments?: Array<{
      id: string;
      filePath: string;
      fileType: string;
      fileName: string;
      fileSize: number;
      metadata: {
        mimeType: string;
        position?: number;
        dimensions?: { width: number; height: number };
        pageCount?: number;
        textContent?: string;
        imageDetail?: 'low' | 'high' | 'auto';
        base64Data?: string;
      };
    }>;
    hasVisionContent?: boolean;
    [key: string]: any;
  } | null;
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
  chatId?: string;
  messagePairId?: string;
  model?: string;
  dominationField?: string;
  customPrompt?: string;
  chatTopic?: string;
  metadata?: Record<string, any>;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onChatUpdate?: (update: Chat | ChatAction) => void;
  onProgress?: (progress: number) => void;
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

export type MessageContent = {
  type: 'text';
  text: string;
} | {
  type: 'image_url';
  image_url: {
    url: string;
    detail: 'low' | 'high' | 'auto';
  };
};

export interface FormattedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string | MessageContent[];
  metadata?: {
    hasVisionContent?: boolean;
    [key: string]: any;
  };
  type?: 'text' | 'image';
}
  