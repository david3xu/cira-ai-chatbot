'use client';

import React, { useReducer, useMemo } from 'react';
import { ChatAPIContext } from '@/lib/features/chat/context/chatContext';
import { ChatAPIState } from '@/lib/types';
import { APIAction } from '@/lib/types';

const initialState: ChatAPIState = {
  isLoading: false,
  isProcessing: false,
  isTyping: false,
  isStreaming: false,
  currentOperation: null,
  error: null,
  pendingRequests: [],
  streamingStatus: 'idle',
  streamingMessage: '',
  streamingMessageId: null,
  loadingMessage: undefined,
  activeOperations: []
};

function apiReducer(state: ChatAPIState, action: APIAction): ChatAPIState {
  switch (action.type) {
    case 'SET_LOADING':
      return { 
        ...state, 
        isProcessing: action.payload 
      };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload 
      };
    case 'SET_STREAMING_STATUS':
      return { 
        ...state, 
        streamingStatus: action.payload 
      };
    case 'START_REQUEST':
      return {
        ...state,
        pendingRequests: [...state.pendingRequests, action.payload],
        isProcessing: true
      };
    case 'END_REQUEST': {
      const newPendingRequests = state.pendingRequests.filter(
        id => id !== action.payload
      );
      return {
        ...state,
        pendingRequests: newPendingRequests,
        isProcessing: newPendingRequests.length > 0
      };
    }
    default:
      return state;
  }
}

export function ChatAPIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(apiReducer, initialState);

  // API State Actions
  const actions = useMemo(() => ({
    startRequest: (requestId: string) => 
      dispatch({ type: 'START_REQUEST', payload: requestId }),
      
    endRequest: (requestId: string) => 
      dispatch({ type: 'END_REQUEST', payload: requestId }),
      
    setStreamingStatus: (status: 'idle' | 'streaming' | 'complete') =>
      dispatch({ type: 'SET_STREAMING_STATUS', payload: status }),
      
    setError: (error: Error | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }),
      
    setLoading: (isLoading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: isLoading })
  }), []);

  // Computed values
  const computedValues = useMemo(() => ({
    isStreaming: state.streamingStatus === 'streaming',
    hasError: state.error !== null,
    hasPendingRequests: state.pendingRequests.length > 0
  }), [state.streamingStatus, state.error, state.pendingRequests]);

  const value = useMemo(() => ({
    state,
    dispatch,
    actions,
    ...computedValues
  }), [state, dispatch, actions, computedValues]);

  return (
    <ChatAPIContext.Provider value={value}>
      {children}
    </ChatAPIContext.Provider>
  );
} 