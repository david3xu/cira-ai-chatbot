import { Chat } from './chat';
import { ChatState } from './chat-state';
import { ChatMessage } from './chat-message';
import { CreateNewChatParams } from './chat-api';
import { Dispatch, SetStateAction } from 'react';

export interface ChatHookReturn {
  currentChat: Chat | null;
  setCurrentChat: Dispatch<SetStateAction<Chat | null>>;
  updateCurrentChat: (updater: (prev: Chat | null) => Chat | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  streamingMessage: string;
  setStreamingMessage: Dispatch<SetStateAction<string>>;
  dominationField: string;
  setDominationField: (field: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  customPrompt?: string;
  setCustomPrompt: (prompt: string | undefined) => void;
  createNewChat: (params: CreateNewChatParams) => Promise<Chat | null>;
  deleteChat: (chatId: string) => Promise<void>;
  loadChat: (chatId: string) => Promise<Chat | null>;
  sendMessage: (content: string, chatId: string) => Promise<Response>;
  addMessage: (message: ChatMessage) => ChatMessage | null;
  chats: Chat[];
}

export interface ChatContextValue {
  state: ChatState;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setStreamingMessage: (message: string) => void;
  setModel: (model: string) => void;
  setDominationField: (field: string) => void;
  setCustomPrompt: (prompt: string | null) => void;
  setCurrentChat: (chat: Chat | null) => void;
  createChat: (params: CreateNewChatParams) => Promise<Chat>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  updateModel: (model: string) => Promise<void>;
  updateChatName: (chatId: string, name: string) => Promise<void>;
  loadChat: (chatId: string) => Promise<Chat>;
  regenerateMessage: (messagePairId: string) => Promise<void>;
  deleteMessage: (messagePairId: string) => Promise<void>;
}

export interface ChatProviderProps {
  children: React.ReactNode;
  initialState?: Partial<ChatState>;
  errorBoundary?: boolean;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  createChat: (params: CreateNewChatParams) => Promise<Chat>;
  updateChat: (id: string, updates: Partial<Chat>) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  regenerateMessage: (id: string) => Promise<void>;
} 