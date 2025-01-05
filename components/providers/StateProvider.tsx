'use client';

import { useEffect, useRef } from 'react';
import { usePersistentState } from '@/lib/hooks/state/usePersistentState';
import { useChat } from '@/lib/hooks/chat/useChat';
import { useChatMessage } from '@/lib/hooks/chat/useChatMessage';

export function StateProvider({ children }: { children: React.ReactNode }) {
  const { updateChats, updateMessages, setCurrentChat } = usePersistentState();
  const { chats, currentChat } = useChat();
  const { messages = [] } = useChatMessage() as { messages?: any[] };
  const prevStateRef = useRef({ chats, currentChat, messages });

  useEffect(() => {
    // Only sync if there are actual changes
    const hasChatsChanged = JSON.stringify(chats) !== JSON.stringify(prevStateRef.current.chats);
    const hasCurrentChatChanged = currentChat?.id !== prevStateRef.current.currentChat?.id;
    const hasMessagesChanged = JSON.stringify(messages) !== JSON.stringify(prevStateRef.current.messages);

    if (hasChatsChanged && chats?.length) {
      updateChats(chats);
    }

    if (hasCurrentChatChanged && currentChat?.id) {
      setCurrentChat(currentChat.id);
    }

    if (hasMessagesChanged && messages?.length) {
      updateMessages(messages);
    }

    // Update ref with current values
    prevStateRef.current = { chats, currentChat, messages };
  }, [chats, currentChat, messages, updateChats, updateMessages, setCurrentChat]);

  return <>{children}</>;
} 