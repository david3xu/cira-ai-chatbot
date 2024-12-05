import { useContext } from 'react';
import { ChatContext } from './chatContext';

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  
  // Add loading state to context
  const { state, dispatch, ...rest } = context;
  const isLoading = state.isLoading || rest.isLoading;

  return {
    ...context,
    isLoading,
    // Helper method to update loading state
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading })
  };
}
