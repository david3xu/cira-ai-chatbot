import { useCallback, useState, useEffect, useRef } from 'react';
import { useGlobalChat } from '@/components/ChatContext';
import { fetchChatHistory } from '@/actions/chat';
import { sendMessageToDatabase } from '@/actions/chat/sendMessage';
import { v4 as uuidv4 } from 'uuid';
import { Chat, ChatMessage } from '@/lib/chat';
import { DEFAULT_MODEL } from '@/lib/modelUtils';

interface UseChatReturn {
  currentChat: Chat | null;
  streamingMessage: string;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  isInitializing: boolean;
  setStreamingMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  dominationField: string;
  setDominationField: (field: string) => void;
  customPrompt: string;
  savedCustomPrompt: string;
  model: string;
  createNewChat: (options: {
    chatId: string;
    model: string;
    customPrompt?: string;
    dominationField: string;
  }) => Promise<Chat>;
  updateCurrentChat: (chatOrUpdater: ((prevChat: Chat | null) => Chat | null)) => void;
  handleSendMessage: (message: string, imageFile?: string | File | undefined) => Promise<void>;
  setCurrentChat: (chat: Chat | null) => void;
  initializeChat: (options: ChatInitOptions) => Promise<Chat | null>;
}         

interface ChatInitOptions {
  customPrompt?: string;
  model?: string;
  dominationField?: string;
}

interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  onError?: (error: any) => void;
}

const retryOperation = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  let lastError;
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      options.onError?.(error);
      if (attempt < options.maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, options.retryDelay));
      }
    }
  }
  throw lastError;
};

// First, define interfaces for the response types
interface MessageResponse {
  id: string;
  content: string;
  dominationField: string;
  image?: string;
  created_at: string;
  chat_topic?: string;
  model?: string;
}

interface SendMessageResponse {
  userMessage: MessageResponse;
  assistantMessage: MessageResponse;
}

export const useChat = (): UseChatReturn => {
  const {
    currentChat,
    streamingMessage,
    setStreamingMessage,
    isLoading,
    setIsLoading,
    updateCurrentChat,
    error,
    setError,
    dominationField,
    setDominationField,
    customPrompt,
    savedCustomPrompt,
    model,
    createNewChat,
    isInitializing,
    setCurrentChat
  } = useGlobalChat();

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const [chatState, setChatState] = useState<{
    currentChat: Chat | null;
    isInitializing: boolean;
    error: string | null;
    lastInitTime: number;
  }>({
    currentChat: null,
    isInitializing: false,
    error: null,
    lastInitTime: 0
  });
  const initializationLock = useRef<boolean>(false);
  const pendingOperations = useRef<Set<string>>(new Set());
  const INIT_COOLDOWN = 2000; // 2 seconds
  const cleanupRef = useRef<Set<() => void>>(new Set());
  const messageCache = useRef<Map<string, ChatMessage>>(new Map());

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.add(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current.clear();
      messageCache.current.clear();
    };
  }, []);

  const loadChatHistory = useCallback(async (chatId: string) => {
    let abortController = new AbortController();
    addCleanup(() => abortController.abort());

    try {
      const history = await fetchChatHistory(chatId);

      if (!abortController.signal.aborted) {
        updateCurrentChat(prev => ({
          ...prev!,
          messages: history,
          historyLoaded: true
        }));
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('Error loading chat history:', error);
        setError('Failed to load chat history');
      }
    }
  }, [updateCurrentChat]);

  useEffect(() => {
    let isSubscribed = true;

    const loadHistory = async () => {
      if (!currentChat?.id) return;
      
      try {
        setIsLoading(true);
        const history = await fetchChatHistory(currentChat.id);
        if (isSubscribed) {
          updateCurrentChat(prev => ({
            ...prev!,
            messages: history,
            historyLoaded: true
          }));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        if (isSubscribed) {
          setError('Failed to load chat history');
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();
    
    return () => {
      isSubscribed = false;
    };
  }, [currentChat?.id]);

  const handleSendMessage = useCallback(async (message: string, imageFile?: string | File | undefined) => {
    if (!currentChat?.id || !message) {
      console.error('Missing required data:', { 
        chatId: currentChat?.id, 
        hasMessage: !!message 
      });
      setError('Missing required chat data');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setStreamingMessage('');

    try {
      const response = await sendMessageToDatabase(
        message,
        currentChat.id,
        dominationField || 'Normal Chat',
        currentChat.messages,
        imageFile
      ) as SendMessageResponse;

      if (response) {
        // Create properly typed ChatMessage objects
        const userMessage: ChatMessage = {
          id: response.userMessage.id,
          role: 'user' as const, // explicitly type as literal
          content: response.userMessage.content,
          dominationField: response.userMessage.dominationField,
          image: response.userMessage.image,
          chat_topic: response.userMessage.chat_topic,
          model: response.userMessage.model,
          created_at: response.userMessage.created_at
        };

        const assistantMessage: ChatMessage = {
          id: response.assistantMessage.id,
          role: 'assistant' as const, // explicitly type as literal
          content: response.assistantMessage.content,
          dominationField: response.assistantMessage.dominationField,
          chat_topic: response.assistantMessage.chat_topic,
          model: response.assistantMessage.model,
          created_at: response.assistantMessage.created_at
        };

        // Update chat with properly typed messages
        updateCurrentChat(prevChat => {
          if (!prevChat) return null;
          return {
            ...prevChat,
            messages: [...prevChat.messages, userMessage, assistantMessage]
          };
        });
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setError('An error occurred while processing your message.');
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  }, [currentChat, dominationField, updateCurrentChat]);

  const canInitialize = useCallback((): boolean => {
    const now = Date.now();
    if (now - chatState.lastInitTime < INIT_COOLDOWN) {
      console.warn(`Please wait ${INIT_COOLDOWN}ms between chat initializations`);
      return false;
    }
    if (initializationLock.current) {
      console.warn('Chat initialization already in progress');
      return false;
    }
    return true;
  }, [chatState.lastInitTime]);

  const initializeChat = useCallback(async (options: ChatInitOptions = {}) => {
    const chatId = uuidv4();
    try {
      // First create in database
      const newChat = await createNewChat({
        chatId,
        customPrompt: options.customPrompt,
        model: options.model || DEFAULT_MODEL,
        dominationField: options.dominationField || 'Normal Chat'
      });
      
      // Then update local state
      setCurrentChat(newChat);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 0));
      
      return newChat;
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to initialize chat');
      throw error;
    }
  }, [createNewChat, setCurrentChat, setError]);

  return {
    currentChat,
    streamingMessage,
    setStreamingMessage,
    isLoading,
    setIsLoading,
    isLoadingHistory,
    error,
    setError,
    dominationField,
    setDominationField,
    customPrompt,
    savedCustomPrompt,
    model,
    createNewChat,
    updateCurrentChat,
    isInitializing,
    handleSendMessage,
    setCurrentChat,
    initializeChat
  };
}; 