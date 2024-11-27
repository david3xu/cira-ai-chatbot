import { useState, useCallback } from 'react';
import { Chat } from '@/lib/types/chat/chat';

interface UseMessageInputProps {
  handleSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  currentChat: Chat | null;
}

export function useMessageInput({
  handleSendMessage,
  isLoading,
  currentChat
}: UseMessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !currentChat) return;

    try {
      await handleSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [message, isLoading, currentChat, handleSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [handleSubmit]);

  return {
    message,
    setMessage,
    handleSubmit,
    handleKeyDown
  };
} 