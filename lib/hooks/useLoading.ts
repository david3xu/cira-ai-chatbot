import { useChatContext } from './chat/useChatContext'

export function useLoading() {
  const { state } = useChatContext()
  
  return {
    isLoading: state.isLoading,
    loadingText: state.loadingMessage || 'Loading...'
  }
} 