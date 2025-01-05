'use client';

import { useContext, useCallback } from 'react';
import { ChatDomainContext } from '@/components/providers/chat/contexts';

export function useChatDomain() {
  const context = useContext(ChatDomainContext);
  if (!context) {
    throw new Error('useChatDomain must be used within ChatDomainProvider');
  }

  const setCustomPrompt = useCallback((prompt: string | null) => {
    console.log('🔧 [useChatDomain] Setting custom prompt:', {
      prompt,
      currentState: context.state
    });
    context.dispatch({ type: 'SET_CUSTOM_PROMPT', payload: prompt });
  }, [context.dispatch, context.state]);

  // Return a memoized version of the context to prevent unnecessary re-renders
  return {
    state: context.state,
    dispatch: context.dispatch,
    actions: context.actions,
    isCustomModel: context.isCustomModel,
    hasCustomPrompt: context.hasCustomPrompt,
    modelConfig: context.modelConfig,
    setCustomPrompt,
  };
} 