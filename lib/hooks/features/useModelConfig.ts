import { useCallback } from 'react'
import { useChatContext } from '../chat/useChatContext'
import { ModelService } from '@/lib/services/ModelService'
import type { ModelConfig } from '@/lib/types'

export function useModelConfig() {
  const { state, dispatch } = useChatContext()

  const updateConfig = useCallback(async (config: Partial<ModelConfig>) => {
    try {
      const updatedConfig = await ModelService.updateModelConfig(state.selectedModel, config)
      dispatch({ type: 'SET_MODEL_CONFIG', payload: updatedConfig })
      return updatedConfig
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error : new Error('Failed to update config')
      })
      throw error
    }
  }, [dispatch])

  return {
    config: state.modelConfig,
    updateConfig
  }
} 