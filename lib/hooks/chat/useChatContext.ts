import { useContext, useEffect, useRef } from 'react';
import { ChatContext } from '@/components/providers/chat/contexts';
import type { Chat } from '@/lib/types';

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
      console.log('🔄 [useChatContext] Chat state updated:', stateSnapshot);
      lastLoggedState.current = stateSnapshot;
    }
  }, [context.state]); // Only depend on the entire state object

  return context;
}
