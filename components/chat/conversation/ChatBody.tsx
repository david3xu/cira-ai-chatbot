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

import React, { useRef, useEffect, useMemo, memo } from 'react';
import { MessageList } from '../messages/Messages';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { useChatMessage } from '@/lib/hooks/chat/useChatMessage';
import { ChatMessage } from '@/lib/types';

export const ChatBody = memo(function ChatBody() {
  const { state } = useChatContext();
  const { isStreaming } = useChatMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useMemo(() => 
    state.currentChat?.messages || state.messages || [],
    [state.currentChat?.messages, state.messages]
  );

  // Create a streaming message object when streaming
  const streamingMessage = useMemo(() => {
    if (!state.streamingMessage) return undefined;
    return {
      id: 'streaming',
      chatId: state.currentChat?.id || '',
      messagePairId: 'streaming',
      userContent: '',
      assistantContent: state.streamingMessage,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto max-w-4xl py-4">
        {messages.length > 0 ? (
          <MessageList 
            messages={messages}
            isStreaming={isStreaming}
            streamingMessage={streamingMessage}
            onDelete={(message) => {/* Add delete handler */}}
            onEdit={(message) => {/* Add edit handler */}}
          />
        ) : (
          <div className="text-center text-gray-500">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}); 