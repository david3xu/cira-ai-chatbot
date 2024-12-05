import { createContext } from 'react';
import { ChatState, initialChatState } from '@/lib/types/chat/chat';
import { ChatAction } from '@/lib/types/chat/chat';
import { CreateNewChatParams, Chat } from '@/lib/types/chat/chat';

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  handleChatCreation: (params: CreateNewChatParams) => Promise<Chat>;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading?: boolean;
  setLoading: (loading: boolean) => void;
  isProcessing: boolean;
  setProcessing: (processing: boolean) => void;
}

export const ChatContext = createContext<ChatContextType>({
  state: initialChatState,
  dispatch: () => null,
  handleChatCreation: async () => { throw new Error('Not implemented') },
  error: null,
  setError: () => null,
  isLoading: false,
  setLoading: () => null,
  isProcessing: false,
  setProcessing: () => null
}); 