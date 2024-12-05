import { ChunkedMessage, MessageChunk } from './messageContent';
import { Dispatch, SetStateAction } from 'react';

// Core Chat Types
export interface Chat {
  id: string;
  userId: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  model: string | null;
  dominationField: string;
  customPrompt: string | null;
  metadata: Record<string, any> | null;
  messages: ChatMessage[];
  chatTopic?: string | null;
  historyLoaded?: boolean;
}

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
  custom_prompt?: string | null;
  status: 'sending' | 'success' | 'failed';
}

export interface ChatMessage {
  id: string;
  chatId: string;
  messagePairId: string;
  userContent: string | null;
  assistantContent: string | null;
  userRole: 'user' | 'system';
  assistantRole: 'assistant';
  model: string;
  dominationField: string;
  customPrompt: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  status: 'sending' | 'success' | 'failed';
  temporary?: boolean;
  isStreaming?: boolean;
  imageUrl?: string;
}

// State Management Types
export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  streamingMessage: string;
  model: string;
  dominationField: string;
  customPrompt: string | null;
}

export const initialChatState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null,
  streamingMessage: '',
  model: 'null',
  dominationField: 'Normal Chat',
  customPrompt: null
};

export type ChatAction =
  | { type: 'UPDATE_CHAT_STATE'; payload: ChatState }
  | { type: 'SET_CURRENT_CHAT'; payload: Chat | null }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Hook Types
export interface ChatHookReturn {
  currentChat: Chat | null;
  setCurrentChat: Dispatch<SetStateAction<Chat | null>>;
  updateCurrentChat: (updater: (prev: Chat | null) => Chat | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  streamingMessage: string;
  setStreamingMessage: (message: string) => void;
  dominationField: string;
  setDominationField: (field: string) => void;
  model: string;
  setModel: (model: string) => void;
  customPrompt?: string;
  setCustomPrompt: (prompt: string | undefined) => void;
  createNewChat: (params: CreateNewChatParams) => Promise<Chat | null>;
  deleteChat: (chatId: string) => Promise<void>;
  loadChat: (chatId: string) => Promise<Chat | null>;
  sendMessage: (content: string, chatId: string) => Promise<Response>;
  addMessage: (message: ChatMessage) => ChatMessage | null;
  chats: Chat[];
}

// API Payload Types
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
  customPrompt?: string | null;
  name: string | null;
  metadata: Record<string, any> | null;
  chatId?: string;
}

export interface CreateChatPayload {
  id?: string;
  user_id: string;
  name: string | null;
  model: string;
  domination_field: string;
  created_at: string;
  updated_at: string;
  custom_prompt: string | null;
  metadata: Record<string, any> | null;
  messages: [];
}

export interface SendMessagePayload {
  chatId: string;
  messagePairId: string;
  dominationField: string;
  message: string;
  model: string;
  imageFile?: string;
  fileType?: string;
}

// Add these types
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
  data?: ChatMessageDB;
  error?: string;
  detail?: string;
}

// Add this interface to your chat.ts types file
export interface MessageOptions {
  model: string;
  dominationField: string;
  messagePairId?: string;
  customPrompt?: string | null;
  metadata?: Record<string, any>;
  status?: 'sending' | 'success' | 'failed';
}

export interface AssistantMessageOptions {
  status: 'sending' | 'success' | 'failed';
  model: string;
  isStreaming?: boolean;
  temporary?: boolean;
  customPrompt?: string | null;
}

export interface ChatUpdate extends Partial<Chat> {
  id: string;
} 