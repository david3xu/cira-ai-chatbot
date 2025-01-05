import { useCallback } from 'react'
import { useChatContext } from './useChatContext'
import { ChatService } from '@/lib/services/ChatService'
import type { Chat, ChatMessage, ChatOptions } from '@/lib/types'

interface APIResponse<T> {
  data: T;
  error: null | {
    message: string;
    status: number;
  };
}

export function useChatAPI() {
  const { state, dispatch } = useChatContext()

  const createChat = useCallback(async (options: ChatOptions): Promise<APIResponse<Chat>> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await ChatService.createChat({
        model: options.model,
        name: options.title || 'New Chat',
        dominationField: options.dominationField,
        customPrompt: options.customPrompt
      })
      return { data: response, error: null }
    } catch (error) {
      return { 
        data: null as any, 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to create chat',
          status: 500
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [dispatch])

  const updateChat = useCallback(async (chatId: string, updates: Partial<ChatOptions>): Promise<APIResponse<Chat>> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await ChatService.updateChat(chatId, updates)
      return { data: response, error: null }
    } catch (error) {
      return {
        data: null as any,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update chat',
          status: 500
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [dispatch])

  const deleteChat = useCallback(async (chatId: string): Promise<APIResponse<boolean>> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await ChatService.deleteChat(chatId)
      return { data: true, error: null }
    } catch (error) {
      return { 
        data: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to delete chat',
          status: 500
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [dispatch])

  return {
    createChat,
    updateChat,
    deleteChat,
    isProcessing: state.isProcessing
  }
}