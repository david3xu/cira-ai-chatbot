'use client';

import { useEffect, useReducer, useRef, useMemo } from 'react';
import { useChat } from '@/lib/hooks/chat/useChat';
import { ChatDomainContext } from './contexts';
import type { ChatDomainState, ChatDomainAction, ChatDomainContextValue } from '@/lib/types/chat-domain-state';
import { ChatService } from '@/lib/services/ChatService';
import { usePersistentState } from '@/lib/hooks/state/usePersistentState';

const getInitialState = (): ChatDomainState => {
  // Get saved domination field from localStorage
  let savedDomainField = 'NORMAL_CHAT';
  if (typeof window !== 'undefined') {
    const storedField = localStorage.getItem('selectedDominationField');
    if (storedField) {
      savedDomainField = storedField;
      console.log('🔄 [ChatDomainProvider] Restored domination field from localStorage:', storedField);
    }
  }

  return {
    dominationField: savedDomainField,
    selectedModel: '',
    temperature: 0.7,
    maxTokens: 2000,
    customPrompt: null,
    chats: [],
    currentChat: null,
    currentMessage: null,
    messages: [],
    searchResults: [],
    searchQuery: null,
    filteredChats: null,
    models: [],
    modelConfig: null
  };
};

export function ChatDomainProvider({ children }: { children: React.ReactNode }) {
  const { customPrompt } = usePersistentState();
  const prevDominationField = useRef<string | null>(null);
  
  const [state, dispatch] = useReducer((state: ChatDomainState, action: ChatDomainAction): ChatDomainState => {
    switch (action.type) {
      case 'SET_DOMINATION_FIELD':
        console.log('🔄 [ChatDomainProvider] Setting domination field:', {
          current: state.dominationField,
          new: action.payload
        });
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedDominationField', action.payload);
        }
        return { ...state, dominationField: action.payload };
        
      case 'SET_MODEL':
        return { ...state, selectedModel: action.payload };
        
      case 'SET_TEMPERATURE':
        return { ...state, temperature: action.payload };
        
      case 'SET_MAX_TOKENS':
        return { ...state, maxTokens: action.payload };
        
      case 'SET_CUSTOM_PROMPT':
        return { ...state, customPrompt: action.payload };
        
      case 'SYNC_WITH_CHAT_STATE':
        const customPromptToUse = action.payload.customPrompt === undefined 
          ? state.customPrompt 
          : action.payload.customPrompt;
        
        // Always prefer the chat's domination field if available
        const dominationFieldToUse = action.payload.dominationField || state.dominationField;
        
        console.log('🔄 [ChatDomainProvider] Syncing with chat state:', {
          currentField: state.dominationField,
          chatField: action.payload.dominationField,
          finalField: dominationFieldToUse
        });
        
        // Save domination field to localStorage for persistence
        if (typeof window !== 'undefined' && dominationFieldToUse !== state.dominationField) {
          localStorage.setItem('selectedDominationField', dominationFieldToUse);
        }
        
        // Only update if values are different to avoid unnecessary rerenders
        if (customPromptToUse === state.customPrompt &&
            dominationFieldToUse === state.dominationField &&
            action.payload.model === state.selectedModel) {
          return state;
        }
        
        return {
          ...state,
          dominationField: dominationFieldToUse,
          selectedModel: action.payload.model || state.selectedModel,
          customPrompt: customPromptToUse,
        };
        
      default:
        return state;
    }
  }, { ...getInitialState(), customPrompt: customPrompt || null });

  // Monitor domination field changes
  useEffect(() => {
    if (prevDominationField.current !== state.dominationField) {
      console.log('🔄 [ChatDomainProvider] Domination field changed:', {
        from: prevDominationField.current,
        to: state.dominationField
      });
      prevDominationField.current = state.dominationField;
    }
  }, [state.dominationField]);

  const value: ChatDomainContextValue = useMemo(() => ({
    state,
    dispatch,
    actions: {
      setDominationField: (field: string) => {
        console.log('🔄 [ChatDomainProvider] Action: setDominationField:', field);
        dispatch({ type: 'SET_DOMINATION_FIELD', payload: field });
      },
      setModel: (model: string) => dispatch({ type: 'SET_MODEL', payload: model }),
      setTemperature: (temp: number) => dispatch({ type: 'SET_TEMPERATURE', payload: temp }),
      setMaxTokens: (tokens: number) => dispatch({ type: 'SET_MAX_TOKENS', payload: tokens }),
      setCustomPrompt: (prompt: string | null) => dispatch({ type: 'SET_CUSTOM_PROMPT', payload: prompt }),
      syncWithChatState: (chatState: any) => {
        console.log('🔄 [ChatDomainProvider] Action: syncWithChatState:', {
          currentField: state.dominationField,
          chatField: chatState.dominationField
        });
        dispatch({ type: 'SYNC_WITH_CHAT_STATE', payload: chatState });
      },
    },
    isCustomModel: state.selectedModel === 'custom',
    hasCustomPrompt: Boolean(state.customPrompt),
    modelConfig: {
      model: state.selectedModel,
      temperature: state.temperature,
      maxTokens: state.maxTokens
    }
  }), [state]);

  return (
    <ChatDomainContext.Provider value={value}>
      {children}
    </ChatDomainContext.Provider>
  );
} 