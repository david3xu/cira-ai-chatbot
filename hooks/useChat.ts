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
  handleSendMessage: (message: string, imageFile?: string | null) => Promise<void>;
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

  const handleSendMessage = useCallback(async (message: string, imageFile?: string | null) => {
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

    // Create and add user message to chat immediately
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      dominationField: dominationField || 'Normal Chat'
    };

    try {
      // First store the message in the database
      const result = await sendMessageToDatabase(
        message,
        currentChat.id,
        dominationField || 'Normal Chat',
        currentChat.messages,
        imageFile || undefined
      );

      if (!result) {
        throw new Error('Failed to store message in database');
      }

      // Update local chat state with stored message
      updateCurrentChat(prevChat => ({
        ...prevChat!,
        messages: [...prevChat!.messages, userMessage as ChatMessage]
      }));

      // Rest of streaming response handling...
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chatId: currentChat.id,
          dominationField: dominationField || 'Normal Chat',
          model: model,
          imageFile: imageFile || undefined,
          customPrompt: customPrompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} ${JSON.stringify(errorData)}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let accumulatedMessage = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convert the Uint8Array to string
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.token) {
                accumulatedMessage += data.token;
                setStreamingMessage(accumulatedMessage);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // After streaming is complete, update the chat with the full assistant message
      if (accumulatedMessage) {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: accumulatedMessage,
          dominationField: dominationField || 'Normal Chat',
          model: model
        };

        updateCurrentChat(prevChat => ({
          ...prevChat!,
          messages: [...prevChat!.messages, assistantMessage]
        }));
      }

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while processing your message.');
    } finally {
      setIsLoading(false);
    }
  }, [currentChat, model, dominationField, customPrompt, setIsLoading, setError, setStreamingMessage]);

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
      const newChat = await createNewChat({
        chatId,
        customPrompt: options.customPrompt,
        model: options.model || DEFAULT_MODEL,
        dominationField: options.dominationField || 'Normal Chat'
      });
      
      setCurrentChat(newChat);
      return newChat;
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    }
  }, [createNewChat, setCurrentChat]);

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