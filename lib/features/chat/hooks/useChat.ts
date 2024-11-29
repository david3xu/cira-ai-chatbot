import { useState, useCallback, useEffect, useRef } from 'react';
import { Chat, ChatMessage, CreateNewChatParams } from '@/lib/types/chat/chat';
import { useChatContext } from '../context/useChatContext';
import { ChatService } from '@/lib/services/chat/ChatService';
import { handleError } from '@/lib/utils/error';
import ReactDOM from 'react-dom';

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

  useEffect(() => {
    console.log('useChat state update:', {
      currentChat,
      streamingMessage,
      isLoading,
      error
    });
  }, [currentChat, streamingMessage, isLoading, error]);

  const updateCurrentChat = useCallback((updater: (prev: Chat | null) => Chat | null) => {
    console.log('Updating chat:', {
      previous: currentChat,
      isUpdating: isUpdatingRef.current
    });
    
    setCurrentChat(prev => {
      const updated = updater(prev);
      console.log('Chat update result:', updated);
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
      // Ensure required fields with defaults
      const chatData: CreateNewChatParams = {
        model: params.model || model || 'llama3.1',
        dominationField: params.dominationField || dominationField || 'Normal Chat',
        source: params.source,
        name: params.source === 'input' ? 
          (params.name || params.metadata?.initialMessage?.substring(0, 30)) : 
          'New Chat',
        metadata: params.metadata || null,
        customPrompt: params.customPrompt || null
      };

      const chat = await ChatService.createChat(chatData);
      
      if (!chat) {
        throw new Error('Failed to create chat');
      }

      // Create initial message if from input
      let initialMessage: ChatMessage | null = null;
      if (params.source === 'input' && params.metadata?.initialMessage) {
        initialMessage = {
          id: crypto.randomUUID(),
          chatId: chat.id,
          messagePairId: crypto.randomUUID(),
          userContent: params.metadata.initialMessage,
          assistantContent: null,
          userRole: 'user',
          assistantRole: 'assistant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'sending',
          dominationField: chat.dominationField,
          model: chat.model
        };
      }

      // Prepare chat with initial message
      const chatWithMessage = initialMessage ? {
        ...chat,
        messages: [initialMessage]
      } : chat;

      // Batch UI updates
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrentChat(chatWithMessage);
        dispatch({
          type: 'UPDATE_CHAT_STATE',
          payload: {
            currentChat: chatWithMessage,
            chats: [...state.chats, chat]
          }
        });

        // Store in storage with messages
        localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chatWithMessage));
        sessionStorage.setItem(`chat_${chat.id}`, JSON.stringify(chatWithMessage));
        sessionStorage.setItem('currentChat', JSON.stringify(chatWithMessage));
      });

      // Save initial message if exists
      if (initialMessage) {
        await ChatService.saveMessage(initialMessage);
      }

      return chatWithMessage;
    } catch (error) {
      console.error('Create chat error:', error);
      throw error;
    }
  }, [dispatch, state.chats, model, dominationField]);

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

  const updateModel = useCallback(async (newModel: string) => {
    try {
      setModel(newModel); // Keep this for global model state
      
      if (currentChat?.id) {
        // Use updateCurrentChat to maintain consistency with other state updates
        updateCurrentChat(prev => prev ? {
          ...prev,
          model: newModel,
          updatedAt: new Date().toISOString()
        } : null);
        
        // Update in localStorage
        const chatData = localStorage.getItem(`chat_${currentChat.id}`);
        if (chatData) {
          const updatedChat = { ...JSON.parse(chatData), model: newModel };
          localStorage.setItem(`chat_${currentChat.id}`, JSON.stringify(updatedChat));
        }
      }
    } catch (error) {
      handleError(error, setError);
      throw error;
    }
  }, [currentChat?.id, updateCurrentChat]);

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
    chats: state.chats,
    updateModel
  };
} 