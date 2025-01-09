'use client'

import React, { useReducer, useMemo, useRef, useEffect } from 'react'
import { ChatContext } from '@/lib/features/chat/context/chatContext';
import { ChatState, ChatAction, ChatMessage, Chat } from '@/lib/types/'
import { initialChatState } from '@/lib/types/chat-state';
import { chatReducer } from '@/lib/reducers/chatReducer';
import { ChatService } from '@/lib/services/ChatService';

const initialState: ChatState = initialChatState;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const prevState = useRef(state);

  // Load chats on initialization
  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await ChatService.getAllChats();
        dispatch({ type: 'SET_CHATS', payload: chats });
      } catch (error) {
        console.error('Failed to load chats:', error);
        dispatch({ type: 'SET_ERROR', payload: error as Error });
      }
    };

    loadChats();
  }, []);

  // Log only when important state properties change
  useEffect(() => {
    const hasImportantChanges = 
      state.currentChat?.id !== prevState.current.currentChat?.id ||
      state.messages?.length !== prevState.current.messages?.length ||
      state.error !== prevState.current.error ||
      state.isLoading !== prevState.current.isLoading ||
      state.isStreaming !== prevState.current.isStreaming;

    if (hasImportantChanges) {
      console.log('🔄 ChatProvider state changed:', {
        prev: {
          chatId: prevState.current.currentChat?.id,
          messageCount: prevState.current.messages?.length
        },
        current: {
          chatId: state.currentChat?.id,
          messageCount: state.messages?.length,
          error: state.error,
          isLoading: state.isLoading,
          isStreaming: state.isStreaming
        }
      });
      prevState.current = state;
    }
  }, [state]);

  const actions = useMemo(() => ({
    setError: (error: Error | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setStreaming: (streaming: boolean) => {
      dispatch({ type: 'SET_STREAMING', payload: streaming });
    },
    setCurrentChat: (chat: Chat | null) => {
      dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
    },
    setMessages: (messages: ChatMessage[]) => {
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    },
    setChats: (chats: Chat[]) => {
      dispatch({ type: 'SET_CHATS', payload: chats });
    },
    addChat: (chat: Chat) => {
      dispatch({ type: 'SET_CHATS', payload: [...state.chats, chat] });
    },
    updateMessage: (messageId: string, updates: Partial<ChatMessage>) => {
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { id: messageId, ...updates }
      });
    },
    toggleSidebar: () => {},
    setTheme: () => {},
    toggleSettings: () => {},
    selectMessage: () => {},
    toggleTheme: () => {},
    setEditing: () => {},
    setEditingMessage: () => {},
    setInputFocus: () => {},
    setInputHeight: () => {},
    setScrollPosition: () => {},
    setLoadingState: () => {},
    startRequest: () => {},
    endRequest: () => {},
    setStreamingStatus: () => {}
  }), [state.chats]);

  return (
    <ChatContext.Provider value={{
      state,
      dispatch,
      actions,
      error: state.error?.message || null,
      isLoading: state.isLoading,
      isProcessing: state.isProcessing || false
    }}>
      {children}
    </ChatContext.Provider>
  );
} 