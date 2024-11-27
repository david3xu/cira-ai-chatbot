import { createContext, useContext, Dispatch } from 'react';
import { ChatState, Chat, ChatMessage } from '@/lib/types/chat/chat';
import { ChatAction } from '@/lib/types/chat/actions';

export const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null
};

interface ChatContextType {
  state: ChatState;
  dispatch: Dispatch<ChatAction>;
  handleChatCreation: (params: {
    id?: string;
    model?: string;
    dominationField?: string;
    source: 'input' | 'sidebar';
  }) => Promise<Chat>;
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

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'UPDATE_CHAT_STATE':
      return {
        ...state,
        currentChat: action.payload.currentChat,
        chats: action.payload.chats,
        error: null
      };

    case 'SET_CURRENT_CHAT':
      if (action.payload) {
        sessionStorage.setItem('currentChat', JSON.stringify(action.payload));
      }
      return {
        ...state,
        currentChat: action.payload,
        error: null
      };

    case 'SET_CHATS':
      localStorage.setItem('chats', JSON.stringify(action.payload));
      return {
        ...state,
        chats: action.payload,
        error: null
      };

    case 'ADD_MESSAGE':
      if (!state.currentChat) return state;
      const updatedChat = {
        ...state.currentChat,
        messages: [...state.currentChat.messages, action.payload]
      };
      return {
        ...state,
        currentChat: updatedChat,
        messages: [...state.messages, action.payload],
        chats: state.chats.map(chat => 
          chat.id === updatedChat.id ? updatedChat : chat
        )
      };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 