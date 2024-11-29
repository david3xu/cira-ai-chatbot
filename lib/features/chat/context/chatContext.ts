import { createContext } from 'react';
import { ChatState, Chat } from '@/lib/types/chat/chat';
import { ChatAction } from '@/lib/types/chat/actions';
import { CreateNewChatParams } from '@/lib/types/chat/chat';

export const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null
};

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  handleChatCreation: (params: CreateNewChatParams) => Promise<Chat>;
  error: string | null;
  setError: (error: string | null) => void;
}

export const ChatContext = createContext<ChatContextType>({
  state: initialState,
  dispatch: () => null,
  handleChatCreation: async () => { throw new Error('Not implemented') },
  error: null,
  setError: () => {}
}); 