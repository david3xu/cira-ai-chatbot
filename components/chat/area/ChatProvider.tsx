"use client";

import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { ChatContext } from '@/lib/features/chat/context/chatContext';
import { useReducer } from 'react';
import { chatReducer } from '@/lib/features/chat/context/chatReducer';
import { initialChatState, Chat } from '@/lib/types/chat/chat';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ChatService } from '@/lib/services/chat/ChatService';
import { storageActions } from '@/lib/features/chat/actions/storage';
import { handleError } from '@/lib/utils/error';
import ReactDOM from 'react-dom';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    const initializeChat = async () => {
      if (initRef.current) return;
      initRef.current = true;

      try {
        setLoading(true);
        dispatch({ type: 'SET_LOADING', payload: true });

        const { data: dbChats, error: dbError } = await storageActions.database.fetchChats();
        if (dbError) throw dbError;

        const transformedChats: Chat[] = (dbChats || []).map(dbChat => ({
          id: dbChat.id,
          userId: dbChat.id || '',
          name: dbChat.name || '',
          messages: [],
          createdAt: dbChat.createdAt,
          updatedAt: dbChat.updatedAt,
          dominationField: dbChat.dominationField || 'Normal Chat',
          model: dbChat.model || 'null',
          customPrompt: dbChat.customPrompt || null,
          metadata: dbChat.metadata || {}
        }));

        ReactDOM.unstable_batchedUpdates(() => {
          dispatch({ type: 'SET_CHATS', payload: transformedChats });

          const currentChatStr = sessionStorage.getItem('currentChat');
          if (currentChatStr) {
            try {
              const currentChat = JSON.parse(currentChatStr);
              dispatch({ type: 'SET_CURRENT_CHAT', payload: currentChat });
            } catch (error) {
              sessionStorage.removeItem('currentChat');
            }
          }

          setIsInitialized(true);
          setLoading(false);
          dispatch({ type: 'SET_LOADING', payload: false });
        });

      } catch (error) {
        handleError(error, setError);
        ReactDOM.unstable_batchedUpdates(() => {
          setLoading(false);
          dispatch({ type: 'SET_LOADING', payload: false });
          setIsInitialized(true);
        });
      }
    };

    initializeChat();
  }, []);

  // Debounced storage sync
  useEffect(() => {
    if (!state.chats.length) return;

    const timeoutId = setTimeout(() => {
      Promise.all([
        storageActions.persistent.saveChats(state.chats),
        localStorage.setItem('chats', JSON.stringify(state.chats))
      ]).catch(console.error);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [state.chats]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading chat...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ErrorFallback 
          error={error} 
          resetErrorBoundary={() => window.location.reload()} 
        />
      )}
    >
      <ChatContext.Provider value={{ 
        state, 
        dispatch,
        handleChatCreation: ChatService.createChat,
        error,
        setError,
        isLoading,
        setLoading,
        isProcessing,
        setProcessing
      }}>
        {children}
      </ChatContext.Provider>
    </ErrorBoundary>
  );
}

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="text-red-500 p-4">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
    >
      Try again
    </button>
  </div>
); 
