import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/lib/chat';
import { fetchChatHistory } from '@/actions/chat';

interface UseChatHistoryReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  refreshHistory: (chatId: string) => Promise<void>;
}

export const useChatHistory = (chatId?: string): UseChatHistoryReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const history = await fetchChatHistory(id);
      const validMessages = history.filter(msg => 
        msg && (msg.role === 'user' || msg.role === 'assistant') && msg.content
      );
      setMessages(validMessages);
    } catch (err) {
      console.error('Error loading chat history:', err);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chatId) {
      refreshHistory(chatId);
    }
  }, [chatId, refreshHistory]);

  return {
    messages,
    isLoading,
    error,
    refreshHistory
  };
};