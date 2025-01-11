/**
 * ChatBody Component
 * 
 * Chat interface container that provides:
 * - Message list display
 * - Streaming message support
 * - Loading states
 * - Error handling
 */

'use client';

import React, { useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { MessageList } from '../messages/Messages';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { useChatMessage } from '@/lib/hooks/chat/useChatMessage';
import { ChatMessage } from '@/lib/types';

export const ChatBody = memo(function ChatBody() {
  const { state } = useChatContext();
  const { isStreaming, updateMessage, deleteMessage } = useChatMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const lastContentRef = useRef('');
  
  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => 
    state.currentChat?.messages || state.messages || [],
    [state.currentChat?.messages, state.messages]
  );

  // Create a streaming message object when streaming
  const streamingMessage = useMemo(() => {
    if (!state.streamingMessage?.trim()) return undefined;
    return {
      id: 'streaming',
      chatId: state.currentChat?.id || '',
      messagePairId: 'streaming',
      userContent: '',
      assistantContent: state.streamingMessage.trim(),
      userRole: 'system',
      assistantRole: 'assistant',
      dominationField: state.currentChat?.domination_field || 'general',
      model: state.currentChat?.model || '',
      status: 'streaming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streaming: {
        isActive: true,
        startedAt: new Date().toISOString()
      }
    } as ChatMessage;
  }, [state.streamingMessage, state.currentChat]);

  // Track content changes and scroll accordingly
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const currentContent = lastMessage?.assistantContent || '';
    const hasNewMessage = messages.length > prevMessagesLengthRef.current;
    const hasNewContent = currentContent !== lastContentRef.current;

    // Scroll if:
    // 1. New message added
    // 2. Assistant content changed
    // 3. Streaming started
    if (hasNewMessage || hasNewContent || (isStreaming && !lastContentRef.current)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    // Update refs
    prevMessagesLengthRef.current = messages.length;
    lastContentRef.current = currentContent;
  }, [messages, isStreaming, state.streamingMessage]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleDelete = useCallback((message: ChatMessage) => {
    deleteMessage(message.messagePairId);
  }, [deleteMessage]);

  const handleEdit = useCallback((message: ChatMessage) => {
    updateMessage(message.messagePairId, { status: 'sending' });
  }, [updateMessage]);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <MessageList 
        messages={messages}
        isStreaming={isStreaming}
        streamingMessage={streamingMessage}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      <div ref={messagesEndRef} className="h-[1px]" />
    </div>
  );
}); 