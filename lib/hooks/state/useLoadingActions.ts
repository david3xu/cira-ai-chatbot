import { useCallback } from 'react'
import { useChatContext } from '../chat/useChatContext'

interface LoadingOptions {
  showMessage?: boolean
}

export function useLoadingActions() {
  const { dispatch } = useChatContext()

  const startLoading = useCallback((message?: string) => {
    dispatch({ type: 'SET_LOADING_STATE', payload: { isLoading: true, message } })
  }, [dispatch])

  const stopLoading = useCallback(() => {
    dispatch({ type: 'SET_LOADING_STATE', payload: { isLoading: false } })
  }, [dispatch])

  const withLoading = useCallback(async <T>(
    action: () => Promise<T>,
    loadingMessage?: string,
    options: LoadingOptions = {}
  ): Promise<T> => {
    try {
      dispatch({ type: 'SET_LOADING_STATE', payload: { isLoading: true, message: loadingMessage } })
      return await action()
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: { isLoading: false } })
    }
  }, [dispatch])

  return { withLoading, startLoading, stopLoading }
} 