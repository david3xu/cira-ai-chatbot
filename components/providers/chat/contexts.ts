'use client';

import { createContext, Dispatch } from 'react'
import { ChatState, ChatUIState, ChatAPIState, ChatDomainState, ChatActions, Chat, ChatMessage, initialChatState } from '@/lib/types/'
import { UIAction, ChatDomainAction, APIAction } from '@/lib/types'
import { ChatAction } from '@/lib/types/chat-action';
import type { ChatDomainContextValue } from '@/lib/types/chat-domain-state';

export const ChatContext = createContext<{
  state: ChatState & {
    currentChat: Chat | null;
  };
  dispatch: Dispatch<ChatAction>;
  actions: {
    setError: (error: Error | null) => void;
    setLoading: (loading: boolean) => void;
    setStreaming: (streaming: boolean) => void;
    setCurrentChat: (chat: Chat | null) => void;
    setMessages: (messages: ChatMessage[]) => void;
    setChats: (chats: Chat[]) => void;
    addChat: (chat: Chat) => void;
    updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  };
}>({
  state: initialChatState,
  dispatch: () => null,
  actions: {
    setError: () => null,
    setLoading: () => null,
    setStreaming: () => null,
    setCurrentChat: () => null,
    setMessages: () => null,
    setChats: () => null,
    addChat: () => null,
    updateMessage: () => null
  }
});

export interface ChatUIContextValue {
  state: ChatUIState;
  dispatch: React.Dispatch<UIAction>;
  actions: {
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleSettings: (isOpen?: boolean) => void;
    selectMessage: (id: string | null) => void;
    toggleTheme: () => void;
    setEditing: (isEditing: boolean) => void;
    setEditingMessage: (message: ChatMessage | null) => void;
    setInputFocus: (focused: boolean) => void;
    setInputHeight: (height: number) => void;
    setScrollPosition: (position: number) => void;
    setLoadingState: (state: { isLoading: boolean; message?: string }) => void;
  };
  isDarkMode: boolean;
  isMobile: boolean;
  isSidebarOpen: boolean;
}

export const ChatUIContext = createContext<ChatUIContextValue | null>(null);

export interface ChatAPIContextValue {
  state: ChatAPIState;
  dispatch: Dispatch<APIAction>;
  actions: {
    startRequest: (requestId: string) => void;
    endRequest: (requestId: string) => void;
    setStreamingStatus: (status: 'idle' | 'streaming' | 'complete') => void;
  };
}

export const ChatAPIContext = createContext<ChatAPIContextValue | undefined>(undefined)

export const ChatDomainContext = createContext<ChatDomainContextValue | null>(null);

ChatDomainContext.displayName = 'ChatDomainContext'; 