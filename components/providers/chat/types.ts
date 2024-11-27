import { Chat, ChatMessage } from '@/lib/types/chat/chat';

export interface ChatState {
  currentChat: Chat | null;
  error: string | null;
  isLoading: boolean;
  streamingMessage: string;
  dominationField: string;
  model: string;
  customPrompt?: string;
}

export interface ChatContextType extends ChatState {
  updateCurrentChat: (updater: (prev: Chat | null) => Chat | null) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setStreamingMessage: (message: string) => void;
  setDominationField: (field: string) => void;
  setModel: (model: string) => void;
  setCustomPrompt: (prompt?: string) => void;
  loadChat: (chatId: string) => Promise<void>;
} 