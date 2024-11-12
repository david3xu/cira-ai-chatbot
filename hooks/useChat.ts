import { useCallback, useState, useEffect } from 'react';
import { useGlobalChat } from '@/components/ChatContext';
import { fetchChatHistory, handleSendMessage as sendChatMessage } from '@/actions/chat';
import { v4 as uuidv4 } from 'uuid';
import { Chat, ChatMessage } from '@/lib/chat';

interface UseChatReturn {
  currentChat: Chat | null;
  streamingMessage: string;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  isInitializing: boolean;
  setStreamingMessage: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  dominationField: string;
  setDominationField: (field: string) => void;
  customPrompt: string;
  savedCustomPrompt: string;
  model: string;
  createNewChat: () => void;
  updateCurrentChat: (chatOrUpdater: ((prevChat: Chat | null) => Chat | null)) => void;
  handleSendMessage: (message: string, imageFile?: string | null) => Promise<void>;
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
    isInitializing
  } = useGlobalChat();

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const loadChatHistory = useCallback(() => {
    if (!currentChat?.id || currentChat.id.trim() === '') {
      setIsLoadingHistory(false);
      return;
    }

    if (!currentChat?.historyLoaded && retryCount < MAX_RETRIES) {
      setIsLoadingHistory(true);
      fetchChatHistory(currentChat.id)
        .then(history => {
          updateCurrentChat(prevChat => 
            prevChat ? { ...prevChat, messages: history, historyLoaded: true } : null
          );
          setRetryCount(0);
        })
        .catch(error => {
          console.error("Error fetching chat history:", error);
          setError("Failed to load chat history. Retrying...");
          setRetryCount(prev => prev + 1);
        })
        .finally(() => setIsLoadingHistory(false));
    }
  }, [currentChat, updateCurrentChat, setError, retryCount]);

  useEffect(() => {
    if (currentChat?.id) {
      loadChatHistory();
    }
  }, [loadChatHistory, currentChat?.id]);

  const handleSendMessage = useCallback(async (message: string, imageFile?: string | null) => {
    if (!currentChat || !message) return;
    
    setIsLoading(true);
    setError(null);
    setStreamingMessage('');

    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      dominationField: dominationField || 'Normal Chat'
    };

    updateCurrentChat(prevChat => ({
      ...prevChat!,
      messages: [...prevChat!.messages, userMessage as ChatMessage]
    }));

    try {
      const response = await sendChatMessage(
        message,
        imageFile ? new File([imageFile], 'image.png', { type: 'image/png' }) : undefined,
        dominationField || 'Normal Chat',
        savedCustomPrompt || undefined,
        currentChat.id,
        currentChat.messages,
        !!currentChat.historyLoaded,
        model,
        setStreamingMessage
      );

      if (response) {
        updateCurrentChat(prevChat => ({
          ...prevChat!,
          messages: [...prevChat!.messages, response.assistantMessage]
        }));
      }
    } catch (error) {
      setError('An error occurred while processing your message.');
    } finally {
      setIsLoading(false);
    }
  }, [currentChat, dominationField, savedCustomPrompt, model, updateCurrentChat]);

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
    handleSendMessage
  };
}; 