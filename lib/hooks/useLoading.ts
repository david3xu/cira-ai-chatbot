import { useChatContext } from '@/lib/features/chat/context/chatContext'

export function useLoading() {
  const { state } = useChatContext()
  
  return {
    isLoading: state.isLoading,
    loadingText: state.loadingMessage || 'Loading...'
  }
} 