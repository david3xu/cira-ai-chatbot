import { useCallback } from 'react'
import { useChatUI } from '../ui/useChatUI'

interface LoadingOptions {
  showMessage?: boolean
  messagePrefix?: string
}

export function useLoadingState() {
  const { setLoading } = useChatUI()

  const withLoading = useCallback(async <T>(
    action: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> => {
    const message = options.messagePrefix ? `${options.messagePrefix}...` : ''
    try {
      setLoading(true, options.showMessage ? message : '')
      return await action()
    } finally {
      setLoading(false, '')
    }
  }, [setLoading])

  const withLoadingCallback = useCallback(<T extends (...args: any[]) => Promise<any>>(
    callback: T,
    options: LoadingOptions = {}
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return withLoading(() => callback(...args), options)
    }
  }, [withLoading])

  return {
    withLoading,
    withLoadingCallback
  }
} 