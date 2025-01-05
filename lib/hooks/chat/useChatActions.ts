import { useCallback } from 'react';
import { useChat } from './useChat';
import { useNavigation } from '@/lib/navigation/useNavigation';
import type { ChatOptions } from '@/lib/types/chat';

export function useChatActions() {
  const { createChat } = useChat();
  const { navigate } = useNavigation();

  const handleCreateChat = useCallback(async (options: ChatOptions) => {
    const newChat = await createChat(options);
    if (newChat?.id) {
      navigate.toChat(newChat.id);
    }
    return newChat;
  }, [createChat, navigate]);

  return {
    handleCreateChat
  };
}