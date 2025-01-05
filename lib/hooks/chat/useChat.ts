import { useCallback } from 'react'
import { useChatContext } from './useChatContext'
import { useChatAPI } from '@/lib/hooks/chat/useChatAPI'
import { ChatService } from '@/lib/services/ChatService'
import type { ChatOptions, ChatMessage } from '@/lib/types'

export function useChat() {
  const { state, dispatch } = useChatContext()
  const { createChat: apiCreateChat, deleteChat: apiDeleteChat, updateChat: apiUpdateChat } = useChatAPI()

  const editMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: 'SET_EDITING_MESSAGE', payload: message })
  }, [dispatch])

  const createChat = useCallback(async (options: ChatOptions = {}) => {
    console.log('🏗️ [useChat] Creating chat with options:', {
      model: options.model,
      title: options.title,
      dominationField: options.dominationField,
      hasCustomPrompt: !!options.customPrompt,
      customPromptPreview: options.customPrompt ? `${options.customPrompt.slice(0, 50)}...` : null,
      stateCustomPrompt: state.customPrompt
    });

    try {
      const customPrompt = options.customPrompt || state.customPrompt || undefined;
      console.log('🏗️ [useChat] Using custom prompt:', {
        fromOptions: options.customPrompt,
        fromState: state.customPrompt,
        final: customPrompt
      });

      // Get the saved domination field from localStorage
      const savedDomainField = typeof window !== 'undefined' 
        ? localStorage.getItem('selectedDominationField')
        : null;

      // Use the domination field in this priority:
      // 1. Options passed to createChat
      // 2. Saved field in localStorage
      // 3. Current state
      // 4. Default value
      const finalDominationField = options.dominationField || savedDomainField || state.dominationField || 'NORMAL_CHAT';

      console.log('🏗️ [useChat] Using domination field:', {
        fromOptions: options.dominationField,
        fromStorage: savedDomainField,
        fromState: state.dominationField,
        final: finalDominationField
      });

      const response = await ChatService.createChat({
        ...options,
        model: options.model || state.selectedModel,
        dominationField: finalDominationField,
        customPrompt
      });

      console.log('useChat: API response:', {
        chatId: response.id,
        model: response.model,
        dominationField: response.domination_field,
        hasCustomPrompt: !!response.custom_prompt
      });

      if (!response?.id) {
        throw new Error('Invalid chat response');
      }

      // Update state with new chat
      dispatch({ type: 'INITIALIZE_CHAT', payload: response });

      console.log('useChat: New chat created:', {
        chatId: response.id,
        model: response.model,
        dominationField: response.domination_field,
        hasCustomPrompt: !!response.custom_prompt
      });

      return response;
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  }, [state.selectedModel, state.dominationField, state.customPrompt, dispatch]);

  const updateChat = useCallback(async (updates: Partial<ChatOptions>) => {
    if (!state.currentChat) {
      console.warn('useChat: No current chat to update')
      return
    }
    
    console.log('useChat: Updating chat:', {
      chatId: state.currentChat.id,
      updates
    })
    
    try {
      const response = await apiUpdateChat(state.currentChat.id, updates)
      console.log('useChat: Update response:', response)
      
      if (response.error) throw response.error
      
      dispatch({ type: 'UPDATE_CHAT', payload: response.data })
      return response.data
    } catch (error) {
      console.error('useChat: Failed to update chat:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to update chat')})
      throw error
    }
  }, [apiUpdateChat, state.currentChat, dispatch])

  const regenerateMessage = useCallback(async (messagePairId: string) => {
    try {
      const message = await ChatService.regenerateMessage(messagePairId)
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: {
          id: message.id,
          messagePairId: message.messagePairId,
          assistantContent: message.assistantContent || undefined
        }
      })
      return message
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to regenerate message')})
      throw error
    }
  }, [dispatch])

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await apiDeleteChat(chatId)
      dispatch({ type: 'SET_CHATS', payload: state.chats.filter(chat => chat.id !== chatId)})
      if (state.currentChat?.id === chatId) {
        dispatch({ type: 'SET_CURRENT_CHAT', payload: null })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to delete chat')})
      throw error
    }
  }, [apiDeleteChat, state.chats, state.currentChat?.id, dispatch])

  const deleteMessage = useCallback(async (messagePairId: string) => {
    try {
      await ChatService.deleteMessage(messagePairId)
      dispatch({ type: 'DELETE_MESSAGE', payload: messagePairId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to delete message')})
      throw error
    }
  }, [dispatch])

  return {
    chats: state.chats,
    currentChat: state.currentChat,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    error: state.error,
    createChat,
    updateChat,
    regenerateMessage,
    deleteMessage,
    editMessage,
    deleteChat
  }
}