/**
 * ChatContainer Component
 * 
 * Main content area that provides:
 * - Header with model selection and document upload
 * - Chat interface with message display
 * - Message input area with attachments
 */

'use client';

import React, { useCallback, memo } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatBody } from './ChatBody';
import { useChat } from '@/lib/hooks/chat/useChat';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChatInput } from '../input/ChatInput';
import { useNavigation } from '@/lib/navigation/useNavigation';
import type { ChatOptions } from '@/lib/types';

interface ChatContainerProps {
  chatId?: string;
  onCreateChat?: (options: ChatOptions) => Promise<void>;
}

export const ChatContainer = memo(function ChatContainer({ chatId, onCreateChat }: ChatContainerProps) {
  const { isLoading: isProcessing, createChat } = useChat();
  const { navigate } = useNavigation();

  const handleCreateChat = useCallback(async (options: ChatOptions) => {
    const newChat = await createChat(options);
    if (newChat?.id) {
      navigate.toChat(newChat.id);
    }
  }, [createChat, navigate]);

  // Use provided onCreateChat or local handleCreateChat
  const createChatHandler = onCreateChat || handleCreateChat;

  return (
    <div className="chat-container h-screen flex flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto">
        <ChatBody />
      </div>
      <div className="bg-gray-900">
        <div className="max-w-[1200px] mx-auto w-full px-4 py-4">
          <ChatInput onCreateChat={createChatHandler} />
        </div>
      </div>
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <LoadingSpinner size="lg" message="Processing your request..." />
        </div>
      )}
    </div>
  );
}); 