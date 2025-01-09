import { useCallback } from 'react'
import { useChatContext } from '@/lib/features/chat/context/chatContext'

interface LoadingOptions {
  showMessage?: boolean
}

export function useLoadingActions() {
  const { dispatch } = useChatContext()

  const startLoading = useCallback((message?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
  }, [dispatch])

  const stopLoading = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [dispatch])

  const withLoading = useCallback(async <T>(
    action: () => Promise<T>,
    loadingMessage?: string,
    options: LoadingOptions = {}
  ): Promise<T> => {
    try {
      startLoading(loadingMessage)
      return await action()
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return { withLoading, startLoading, stopLoading }
} 