import { useState, useCallback, useEffect, useRef } from 'react';
import { Chat, ChatMessage, ChatState } from '@/lib/types/chat/chat';
import { useChatContext } from '../context/useChatContext';
import { ChatService } from '@/lib/services/chat/ChatService';
import { ErrorHandler } from '@/lib/utils/error';
import ReactDOM from 'react-dom';
import { ChatStorageManager } from '../utils/ChatStorageManager';
import { DOMINATION_FIELDS, DominationField } from '@/lib/features/ai/config/constants';
import { DEFAULT_MODEL } from '@/lib/features/ai/config/constants';

export function useChat() {
  const { state, dispatch, setLoading, setProcessing } = useChatContext();
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, _setProcessing] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  
  const isUpdatingRef = useRef(false);
  const loadingStateRef = useRef(false);
  const previousChatIdRef = useRef<string | null>(null);

  // Initialize states with proper refs to prevent loops
  const [model, setModel] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('selectedModel');
      return savedModel && savedModel !== 'null' ? savedModel : DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
  });

  const [dominationField, setDominationField] = useState<DominationField>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedDomField');
      const defaultField = stored && Object.values(DOMINATION_FIELDS).includes(stored as DominationField)
        ? stored as DominationField
        : DOMINATION_FIELDS.NORMAL_CHAT;
      
      // Ensure we always have a valid value in localStorage
      localStorage.setItem('selectedDomField', defaultField);
      return defaultField;
    }
    return DOMINATION_FIELDS.NORMAL_CHAT;
  });

  const [customPrompt, setCustomPrompt] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customPrompt') || null;
    }
    return null;
  });

  // Single effect to handle all state synchronization
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    const chatId = currentChat?.id;
    if (chatId !== previousChatIdRef.current) {
      isUpdatingRef.current = true;
      previousChatIdRef.current = chatId || null;

      const shouldUpdate = 
        (currentChat?.model && currentChat.model !== model) ||
        (currentChat?.dominationField && currentChat.dominationField !== dominationField) ||
        (currentChat?.customPrompt !== customPrompt);

      if (shouldUpdate) {
        ReactDOM.unstable_batchedUpdates(() => {
          if (currentChat?.model && currentChat.model !== model) {
            setModel(currentChat.model);
            localStorage.setItem('selectedModel', currentChat.model);
          }

          if (currentChat?.dominationField && currentChat.dominationField !== dominationField) {
            const validDomField = Object.values(DOMINATION_FIELDS)
              .includes(currentChat.dominationField as DominationField)
                ? currentChat.dominationField as DominationField
                : DOMINATION_FIELDS.NORMAL_CHAT;
            
            setDominationField(validDomField);
            localStorage.setItem('selectedDomField', validDomField);
          }

          const currentPrompt = typeof currentChat?.customPrompt === 'string' 
            ? currentChat.customPrompt 
            : null;

          if (currentPrompt !== customPrompt) {
            setCustomPrompt(currentPrompt);
            if (currentPrompt) {
              localStorage.setItem('customPrompt', currentPrompt);
            } else {
              localStorage.removeItem('customPrompt');
            }
          }
        });
      }

      isUpdatingRef.current = false;
    }
  }, [currentChat?.id]);

  // Sync processing state with context
  useEffect(() => {
    setProcessing(isProcessing);
  }, [isProcessing, setProcessing]);

  // Handle processing state changes
  const handleProcessing = useCallback((processing: boolean) => {
    _setProcessing(processing);
    setProcessing(processing);
  }, [setProcessing]);

  // Core chat operations
  const sendMessage = useCallback(async (content: string, chatId: string) => {
    console.log('🚀 [useChat] sendMessage started with:', { 
      content, 
      chatId, 
      dominationField,
      customPrompt: typeof currentChat?.customPrompt === 'string' 
        ? currentChat.customPrompt 
        : undefined
    });

    const messagePairId = crypto.randomUUID();
    const response = await ChatService.sendMessage({
      message: content,
      chatId,
      model,
      dominationField,
      messagePairId,
      customPrompt: typeof currentChat?.customPrompt === 'string' 
        ? currentChat.customPrompt 
        : undefined
    });

    return { response, messagePairId };
  }, [model, dominationField, currentChat]);

  // State management
  const updateState = useCallback((updates: Partial<ChatState>) => {
    const fullState: ChatState = {
      ...state,
      ...updates
    };
    
    dispatch({ 
      type: 'UPDATE_CHAT_STATE', 
      payload: fullState
    });
  }, [dispatch, state]);

  const updateCurrentChat = useCallback(async (updater: (prev: Chat | null) => Chat | null) => {
    if (loadingStateRef.current) {
      return;
    }

    const updatedChat = updater(state.currentChat);
    if (!updatedChat) return;

    // Batch updates to prevent multiple re-renders
    ReactDOM.unstable_batchedUpdates(async () => {
      await ChatStorageManager.updateChat(updatedChat);
      dispatch({
        type: 'SET_CURRENT_CHAT',
        payload: updatedChat
      });
      setCurrentChat(updatedChat);
    });
  }, [dispatch, state.currentChat]);

  const loadChat = useCallback(async (chatId: string) => {
    if (!chatId) {
      throw new Error('chat_id is required');
    }

    try {
      // Set loading state and ref
      loadingStateRef.current = true;
      setIsLoading(true);

      const chat = await ChatService.loadChat(chatId);
      
      if (chat) {
        ReactDOM.unstable_batchedUpdates(() => {
          dispatch({
            type: 'SET_CURRENT_CHAT',
            payload: chat
          });
          setCurrentChat(chat);
        });
      }
      return chat;
    } catch (error) {
      const appError = await ErrorHandler.handleChatError(error, 'chat loading');
      throw appError;
    } finally {
      // Reset loading states together
      ReactDOM.unstable_batchedUpdates(() => {
        loadingStateRef.current = false;
        setIsLoading(false);
      });
    }
  }, [dispatch]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      await ChatStorageManager.deleteChat(chatId);
      
      ReactDOM.unstable_batchedUpdates(() => {
        dispatch({
          type: 'SET_CHATS',
          payload: state.chats.filter(chat => chat.id !== chatId)
        });
        
        if (state.currentChat?.id === chatId) {
          setCurrentChat(null);
        }
      });
    } catch (error) {
      const appError = await ErrorHandler.handleChatError(error, 'chat deletion', setError);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, state.chats, state.currentChat]);

  const updateModel = useCallback(async (newModel: string) => {
    console.log('🔄 [useChat] Updating model:', { newModel, currentChat });
    
    setModel(newModel);

    try {
      if (!currentChat?.id) {
        console.log('ℹ️ [useChat] No current chat, only updating local model state');
        return;
      }

      console.log('📝 [useChat] Updating chat model:', { 
        chatId: currentChat.id, 
        oldModel: currentChat.model, 
        newModel 
      });

      const updatedChat = await ChatService.updateModel(currentChat.id, newModel);
      await updateCurrentChat(() => updatedChat);
      
      console.log('✅ [useChat] Chat model updated successfully');
    } catch (error) {
      console.error('💥 [useChat] Error updating model:', error);
      const appError = await ErrorHandler.handleChatError(error, 'chat model update', setError);
      throw appError;
    }
  }, [currentChat?.id, updateCurrentChat]);

  // Improved sync with context
  useEffect(() => {
    if (!isUpdatingRef.current && !loadingStateRef.current && state.currentChat?.id !== currentChat?.id) {
      isUpdatingRef.current = true;
      ReactDOM.unstable_batchedUpdates(() => {
        if (state.currentChat) {
          setCurrentChat(state.currentChat);
        } else if (!isLoading && !loadingStateRef.current) {
          setCurrentChat(null);
        }
      });
      isUpdatingRef.current = false;
    }
  }, [state.currentChat?.id, isLoading]);

  // Add debug logs for currentChat changes
  useEffect(() => {
    console.log('🔄 [useChat] currentChat changed:', {
      id: currentChat?.id,
      currentChat
    });
  }, [currentChat]);

  const updateChatName = useCallback(async (chatId: string, newName: string) => {
    try {
      const updatedChat = await ChatService.updateChatName(chatId, newName);
      await updateCurrentChat(() => updatedChat);
      
      // Update chats list in sidebar
      dispatch({
        type: 'SET_CHATS',
        payload: state.chats.map(chat => 
          chat.id === chatId ? { ...chat, name: newName } : chat
        )
      });
    } catch (error) {
      console.error('Error updating chat name:', error);
    }
  }, [updateCurrentChat, dispatch, state.chats]);

  // Add a new method to handle domination field updates
  const updateDominationField = useCallback(async (newField: DominationField) => {
    if (!Object.values(DOMINATION_FIELDS).includes(newField)) {
      throw new Error('Invalid domination field');
    }

    setDominationField(newField);
    localStorage.setItem('selectedDomField', newField);

    if (currentChat?.id) {
      const updatedChat = await ChatService.updateChat({
        ...currentChat,
        dominationField: newField
      });
      await updateCurrentChat(() => updatedChat);
    }
  }, [currentChat, updateCurrentChat]);

  return {
    // State
    currentChat,
    error,
    isLoading,
    isProcessing,
    streamingMessage,
    model,
    dominationField,
    customPrompt,
    chats: state.chats,

    // State setters
    setCurrentChat,
    setError,
    setIsLoading,
    setProcessing: handleProcessing,
    setStreamingMessage,
    setModel,
    setDominationField,
    setCustomPrompt,

    // Core operations
    sendMessage,
    updateState,
    updateCurrentChat,
    loadChat,
    deleteChat,
    updateModel,
    updateChatName,
    updateDominationField,
  };
} 