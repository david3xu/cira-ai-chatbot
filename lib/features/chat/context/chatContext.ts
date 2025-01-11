'use client';

import { createContext, Dispatch, useContext, useEffect, useRef } from 'react'
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
  error: string | null;
  isLoading: boolean;
  isProcessing: boolean;
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
  },
  error: null,
  isLoading: false,
  isProcessing: false
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

export const ChatAPIContext = createContext<ChatAPIContextValue | undefined>(undefined);

export const ChatDomainContext = createContext<ChatDomainContextValue | null>(null);

ChatDomainContext.displayName = 'ChatDomainContext';

interface StateSnapshot {
  hasCustomPrompt: boolean;
  customPrompt: any;
  currentChat: string | undefined;
}

/**
 * Chat Context Hook
 * 
 * Custom hook for chat context with:
 * - Context validation
 * - Loading state management
 * - Helper methods
 * 
 * Features:
 * - Context access
 * - Error handling
 * - Loading state
 * - Type safety
 */
export function useChatContext() {
  const context = useContext(ChatContext);
  const lastLoggedState = useRef<StateSnapshot>();
  
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }

  // Log state changes for debugging
  useEffect(() => {
    const stateSnapshot: StateSnapshot = {
      hasCustomPrompt: !!context.state.customPrompt,
      customPrompt: context.state.customPrompt,
      currentChat: context.state.currentChat?.id
    };
    
    // Only log if there are meaningful changes
    if (JSON.stringify(stateSnapshot) !== JSON.stringify(lastLoggedState.current)) {
      lastLoggedState.current = stateSnapshot;
    }
  }, [context.state]); // Only depend on the entire state object

  return context;
} 