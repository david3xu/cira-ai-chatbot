"use client";

import React, { ReactNode, useEffect, useCallback, useState } from 'react';
import { ChatContext } from '@/lib/features/chat/context/chatContext';
import { useReducer } from 'react';
import { chatReducer, initialState } from '@/lib/features/chat/context/chatContext';
// import { Chat } from '@/lib/types/chat/chat';
import { ChatService } from '@/lib/services/chat/ChatService';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        // Load saved chats from localStorage
        const savedChats = localStorage.getItem('chats');
        if (savedChats) {
          const chats = JSON.parse(savedChats);
          dispatch({ type: 'SET_CHATS', payload: chats });
        }

        // Load current chat if exists
        const currentChatId = localStorage.getItem('currentChatId');
        if (currentChatId) {
          const chat = await ChatService.getChat(currentChatId);
          if (chat) {
            dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
          }
        }
      } catch (error) {
        console.error('Error loading initial state:', error);
      } finally {
        setIsClient(true);
      }
    };

    loadInitialState();
  }, []);

  const handleChatCreation = useCallback(async (params: {
    id?: string;
    model?: string;
    dominationField?: string;
    source: 'input' | 'sidebar';
  }) => {
    try {
      const chatData = {
        id: params.id,
        model: params.model || 'llama3.1',
        dominationField: params.source === 'input' ? 'Normal Chat' : (params.dominationField || 'Normal Chat'),
        name: 'New Chat',
        messages: []
      };
      
      const chat = await ChatService.createChat(chatData);
      if (!chat?.id) {
        throw new Error('Invalid chat data: missing ID');
      }

      // Update both state and storage
      const updatedChats = [...state.chats, chat];
      dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
      dispatch({ type: 'SET_CHATS', payload: updatedChats });

      // Persist to storage
      localStorage.setItem('currentChatId', chat.id);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      sessionStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));

      return chat;
    } catch (error) {
      console.error('Error in handleChatCreation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create chat');
      throw error;
    }
  }, [state.chats]);

  const ErrorFallback = React.memo(({ error }: { error: Error }) => {
    React.useEffect(() => {
      setError(error.message || 'An unexpected error occurred');
    }, [error]);
    
    return (
      <div className="text-red-500">
        Something went wrong. Please refresh the page.
      </div>
    );
  });

  // Debug logging with proper dependencies
  useEffect(() => {
    if (state.error) {
      console.error('ChatProvider error:', state.error);
    }
  }, [state.error]);

  // Load chats with proper error handling
  useEffect(() => {
    const loadChats = async () => {
      try {
        const chatId = localStorage.getItem('currentChatId');
        if (chatId) {
          const chat = await ChatService.loadChatHistory(chatId);
          if (chat) {
            dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
            if (!state.chats.find(c => c.id === chat.id)) {
              dispatch({ 
                type: 'SET_CHATS', 
                payload: [...state.chats, chat]
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load chats');
      } finally {
        setIsClient(true);
      }
    };

    loadChats();
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Initializing...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ChatContext.Provider value={{ 
        state, 
        dispatch,
        handleChatCreation,
        error,
        setError
      }}>
        {children}
      </ChatContext.Provider>
    </ErrorBoundary>
  );
} 