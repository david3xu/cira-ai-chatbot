"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { ChatContext } from '@/lib/features/chat/context/chatContext';
import { useReducer } from 'react';
import { chatReducer } from '@/lib/features/chat/context/chatReducer';
import { initialState } from '@/lib/features/chat/context/chatContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ChatService } from '@/lib/services/chat/ChatService';
import { Chat, ChatState } from '@/lib/types/chat/chat';
import { fromApiCase } from '@/types/api/transformers';
// import { supabaseAdmin } from '@/lib/supabase/client';
import { storageActions } from '@/lib/features/chat/actions/storage';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    messages: [],
    isLoading: false
  } as ChatState);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        console.log('Loading initial state...');
        
        // 1. Try loading from localStorage first (faster)
        const cachedChats = localStorage.getItem('chats');
        if (cachedChats) {
          const parsedChats = JSON.parse(cachedChats);
          dispatch({ type: 'SET_CHATS', payload: parsedChats });
        }

        // 2. Load from database (source of truth)
        const { data: dbChats, error } = await storageActions.database.fetchChats();
        if (error) throw error;

        if (dbChats) {
          const transformedChats = dbChats.map(chat => fromApiCase(chat) as Chat);
          
          // 3. Update all storage layers
          dispatch({ type: 'SET_CHATS', payload: transformedChats });
          storageActions.persistent.saveChats(transformedChats);
          
          // 4. Load current chat from session if exists
          const currentChatStr = sessionStorage.getItem('currentChat');
          if (currentChatStr) {
            const currentChat = JSON.parse(currentChatStr);
            dispatch({ type: 'SET_CURRENT_CHAT', payload: currentChat });
          }
        }

        setIsClient(true);
      } catch (error) {
        console.error('Error loading initial state:', error);
        setError('Failed to load initial state');
      }
    };

    loadInitialState();
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
        error,
        setError,
        handleChatCreation: ChatService.createChat
      }}>
        {children}
      </ChatContext.Provider>
    </ErrorBoundary>
  );
}

const ErrorFallback = React.memo(({ error }: { error: Error }) => (
  <div className="text-red-500">
    Something went wrong. Please refresh the page.
  </div>
));

ErrorFallback.displayName = 'ErrorFallback'; 
