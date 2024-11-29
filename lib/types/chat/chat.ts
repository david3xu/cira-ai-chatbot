import { ChunkedMessage, MessageChunk } from './messageContent';
import { Dispatch, SetStateAction } from 'react';

export interface Chat {
  id: string;
  userId: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  model: string;
  dominationField: string;
  customPrompt: string | null;
  metadata: Record<string, any> | null;
  messages: ChatMessage[];
  chatTopic?: string | null;
  historyLoaded?: boolean;
}

export interface ChatMessageDB extends ChunkedMessage {
  id: string;
  chatId: string;
  messagePairId: string;
  userContent: string;
  assistantContent: string | null;
  userRole: 'user' | 'system';
  assistantRole: 'assistant' | 'system';
  createdAt: string;
  updatedAt: string;
  dominationField: string;
  model: string;
  imageUrl?: string;
  chatTopic?: string;
  metadata?: Record<string, any>;
  contentChunks?: MessageChunk[];
  customPrompt?: string | null;
}

export interface ChatMessage extends ChatMessageDB {
  temporary?: boolean;
  status?: 'sending' | 'failed' | 'success';
  isStreaming?: boolean;
  userId?: string;
}

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
  model: string;
  dominationField: string;
  source: 'sidebar' | 'input';
  customPrompt?: string | null;
  name: string | null;
  metadata: Record<string, any> | null;
  chatId?: string;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

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
  customPrompt?: string | null;
} 