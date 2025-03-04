import { useCallback, useRef, useMemo } from 'react'
import { useChatContext } from '@/lib/features/chat/context/chatContext'
import { useChat } from './useChat'
import { ChatService } from '@/lib/services/ChatService'
import type { ChatMessage } from '@/lib/types'
import { MessageStatus } from '@/lib/types/chat-message'
import { ChatError, ErrorCodes } from '@/lib/types/errors'
import { usePersistentState } from '@/lib/hooks/state/usePersistentState'

export function useChatMessage() {
  const { state, dispatch } = useChatContext()
  const { createChat } = useChat()
  const { customPrompt, setCustomPrompt } = usePersistentState()
  const streamController = useRef<AbortController>()
  const chatLoadingRef = useRef<boolean>(false)
  const lastMessageRef = useRef<string | null>(null)

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    if (!state.currentChat?.messages) return

    // Only update if content has changed and is not null/undefined
    if (updates.assistantContent === lastMessageRef.current || 
        updates.assistantContent === undefined || 
        updates.assistantContent === null) return
    lastMessageRef.current = updates.assistantContent

    // Batch updates to prevent multiple re-renders
    dispatch({
      type: 'UPDATE_MESSAGE',
      payload: {
        id: messageId,
        ...updates,
        updatedAt: new Date().toISOString(),
        status: updates.status || 'success'
      }
    })
  }, [dispatch, state.currentChat?.messages])

  const loadChat = useCallback(async (chatId: string) => {
    if (!chatId) return;
    if (chatLoadingRef.current) {
      return;
    }
    
    chatLoadingRef.current = true;
    const maxRetries = 3;
    const retryDelay = 500; // 500ms
    let retries = 0;
    
    try {
      while (retries < maxRetries) {
        try {
          const response = await ChatService.getChat(chatId);
          if (!response?.id) {
            throw new ChatError('Invalid chat data', ErrorCodes.NOT_FOUND);
          }
          
          // Get the saved domination field from localStorage
          const savedDomainField = localStorage.getItem('selectedDominationField');
          
          // For new chats (no messages), use the saved field if available
          const isNewChat = !response.messages || response.messages.length === 0;
          const finalDominationField = isNewChat && savedDomainField 
            ? savedDomainField 
            : response.domination_field;
          
          // Only update localStorage for existing chats
          if (!isNewChat && finalDominationField) {
            localStorage.setItem('selectedDominationField', finalDominationField);
          }

          // Determine which custom prompt to use
          const chatPrompt = response.custom_prompt;
          const persistentPrompt = customPrompt;
          const finalPrompt = chatPrompt || persistentPrompt || null;
          
          // Batch state updates
          dispatch({ 
            type: 'SET_CURRENT_CHAT', 
            payload: {
              ...response,
              domination_field: finalDominationField,
              custom_prompt: finalPrompt
            }
          });
          if (response.model) {
            dispatch({ type: 'SET_MODEL', payload: response.model });
          }
          // Update the domination field in the state
          dispatch({ type: 'SET_DOMINATION_FIELD', payload: finalDominationField });
          
          // Always update custom prompt state to maintain consistency
          dispatch({ type: 'SET_CUSTOM_PROMPT', payload: finalPrompt });
          setCustomPrompt(finalPrompt);
          
          return response;
        } catch (error) {
          if (error instanceof ChatError && error.code === ErrorCodes.NOT_FOUND) {
            if (retries < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              retries++;
              continue;
            }
          }
          throw error;
        }
      }
    } finally {
      chatLoadingRef.current = false;
    }
  }, [dispatch, setCustomPrompt]);

  const sendMessage = useCallback(async (content: string, options?: { metadata?: Record<string, any> }) => {
    if (!content.trim()) {
      console.warn('Empty message content')
      return
    }

    // If no current chat, create one first
    if (!state.currentChat?.id) {
      try {
        const newChat = await createChat({
          model: state.selectedModel,
          title: 'New Chat',
          dominationField: state.dominationField || 'NORMAL_CHAT',
          customPrompt: customPrompt ?? undefined
        })
        
        if (!newChat?.id) {
          throw new Error('Failed to create new chat')
        }
      } catch (error) {
        console.error('Failed to create chat:', error)
        return
      }
    }

    const messageId = crypto.randomUUID()
    const messagePairId = crypto.randomUUID()

    const newMessage: ChatMessage = {
      id: messageId,
      chatId: state.currentChat!.id,
      messagePairId,
      userContent: content,
      assistantContent: '',
      userRole: 'user',
      assistantRole: 'assistant',
      model: state.selectedModel || '',
      dominationField: state.dominationField || 'NORMAL_CHAT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sending',
      customPrompt: customPrompt ?? undefined,
      metadata: options?.metadata || {}
    }

    // Add message to UI immediately
    dispatch({ 
      type: 'ADD_MESSAGE', 
      payload: { message: newMessage }
    })

    // Set streaming state
    dispatch({ type: 'SET_STREAMING', payload: true })
    dispatch({ type: 'SET_STREAMING_MESSAGE_ID', payload: messageId })

    try {
      // Send message to API
      const response = await ChatService.sendMessage(content, {
        chatId: state.currentChat!.id,
        model: state.selectedModel,
        messagePairId,
        dominationField: state.dominationField,
        customPrompt: customPrompt ?? undefined,
        metadata: options?.metadata,
        onMessage: (message) => {
          if (typeof message.assistantContent === 'string') {
            dispatch({ 
              type: 'UPDATE_MESSAGE', 
              payload: {
                id: messageId,
                assistantContent: message.assistantContent,
                status: message.status,
                metadata: message.metadata
              }
            })
          }
        },
        onError: (error) => {
          console.error('Message error:', error)
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              id: messageId,
              status: 'failed'
            }
          })
        },
        onChatUpdate: (chatUpdate: any) => {
          if ('type' in chatUpdate) {
            dispatch(chatUpdate)
          } else {
            dispatch({
              type: 'UPDATE_CHAT',
              payload: chatUpdate
            })
          }
        }
      })

      return response
    } catch (error) {
      console.error('Failed to send message:', error)
      // Update message status to error
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: messageId,
          status: 'failed'
        }
      })
      throw error
    } finally {
      // Reset streaming state
      dispatch({ type: 'SET_STREAMING', payload: false })
      dispatch({ type: 'SET_STREAMING_MESSAGE_ID', payload: null })
    }
  }, [state.currentChat, state.selectedModel, state.dominationField, customPrompt, createChat, dispatch])

  const deleteMessage = useCallback((messageId: string) => {
    dispatch({
      type: 'DELETE_MESSAGE',
      payload: messageId
    })
  }, [dispatch])

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    streamingMessageId: state.streamingMessageId,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadChat,
    stopStreaming: () => {
      if (streamController.current) {
        streamController.current.abort()
      }
    }
  }
}