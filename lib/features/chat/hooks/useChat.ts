import { useState, useCallback, useEffect, useRef } from 'react';
import { Chat, ChatMessage, CreateNewChatParams } from '@/lib/types/chat/chat';
import { useChatContext } from '../context/chatContext';
import { ChatService } from '@/lib/services/chat/ChatService';
import { handleError } from '@/lib/utils/error';

export function useChat() {
  const { state, dispatch, handleChatCreation } = useChatContext();
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [dominationField, setDominationField] = useState('Normal Chat');
  const [model, setModel] = useState('llama3.1');
  const [customPrompt, setCustomPrompt] = useState<string | undefined>();
  
  // Use ref to track if we're in a render cycle
  const isUpdatingRef = useRef(false);

  // Sync with context only when ID changes
  useEffect(() => {
    if (state.currentChat?.id !== currentChat?.id) {
      setCurrentChat(state.currentChat);
    }
  }, [state.currentChat?.id]);

  const updateCurrentChat = useCallback((updater: (prev: Chat | null) => Chat | null) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setCurrentChat(prev => {
      const updated = updater(prev);
      if (!updated) return prev;

      // Schedule context update for next tick
      Promise.resolve().then(() => {
        dispatch({
          type: 'UPDATE_CHAT_STATE',
          payload: {
            currentChat: updated,
            chats: state.chats.map(chat => 
              chat.id === updated.id ? updated : chat
            )
          }
        });
        isUpdatingRef.current = false;
      });

      return updated;
    });
  }, [dispatch, state.chats]);

  const addMessage = useCallback((message: ChatMessage) => {
    if (!message.chatId) {
      console.error('Cannot add message: No chat ID provided');
      return null;
    }

    // Schedule message update for next tick
    Promise.resolve().then(() => {
      updateCurrentChat(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), message],
          updatedAt: new Date().toISOString()
        };
      });
    });

    return message;
  }, [updateCurrentChat]);

  const createNewChat = useCallback(async (params: CreateNewChatParams): Promise<Chat | null> => {
    try {
      const payload = {
        model: params.model,
        domination_field: params.dominationField,
        name: params.name || null,
        user_id: '00000000-0000-0000-0000-000000000000',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        custom_prompt: null,
        metadata: params.metadata || null,
        messages: []
      };

      console.log('Sending create chat payload:', payload);

      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log('Full response:', responseData);
      console.log('Create chat response:', {
        responseData,
        chat: responseData.data.chat,
        success: responseData.success
      });

      if (!response.ok) {
        throw new Error(`Failed to create chat: ${responseData.error || 'Unknown error'}`);
      }

      if (!responseData.data?.chat) {
        throw new Error('Chat data missing from response');
      }

      return responseData.data.chat;
    } catch (error) {
      console.error('Create chat error:', error instanceof Error ? error.message : error);
      return null;
    }
  }, []);

  const loadChat = useCallback(async (chatId: string): Promise<Chat | null> => {
    try {
      setIsLoading(true);
      
      // Try to get from localStorage first
      const persistedChat = localStorage.getItem(`chat_${chatId}`);
      if (persistedChat) {
        const chat = JSON.parse(persistedChat);
        setCurrentChat(chat);
        dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
        return chat;
      }

      // Fallback to API
      const chat = await ChatService.getChat(chatId);
      if (chat) {
        setCurrentChat(chat);
        dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
        localStorage.setItem(`chat_${chatId}`, JSON.stringify(chat));
        return chat;
      }
      return null;
    } catch (error) {
      handleError(error, setError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const sendMessage = useCallback(async (content: string, chatId: string) => {
    try {
      if (!model || !dominationField) {
        throw new Error('Missing required fields');
      }

      const response = await ChatService.sendMessage({
        message: content,
        chatId,
        model,
        dominationField,
        messagePairId: crypto.randomUUID(),
        customPrompt: currentChat?.customPrompt || undefined
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response;
    } catch (error) {
      handleError(error, setError);
      throw error;
    }
  }, [model, dominationField, currentChat]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      await ChatService.deleteChat(chatId);
      
      dispatch({
        type: 'SET_CHATS',
        payload: state.chats.filter(chat => chat.id !== chatId)
      });
      
      if (state.currentChat?.id === chatId) {
        setCurrentChat(null);
      }
    } catch (error) {
      handleError(error, setError);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, state.chats, state.currentChat]);

  return {
    currentChat,
    setCurrentChat,
    updateCurrentChat,
    error,
    setError,
    isLoading,
    setIsLoading,
    streamingMessage,
    setStreamingMessage,
    dominationField,
    setDominationField,
    model,
    setModel,
    customPrompt,
    setCustomPrompt,
    createNewChat,
    deleteChat,
    loadChat,
    sendMessage,
    addMessage,
    chats: state.chats
  };
} 