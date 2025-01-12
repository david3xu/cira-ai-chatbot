"use client"

import React, { useCallback, useEffect, useRef, memo } from 'react';
import { ChatMessage } from '@/lib/types/chat';
import { MessageItem } from './MessageItem';
import { useChatContext } from '@/lib/features/chat/context/chatContext';

// Memoize individual message items
const MemoizedMessageItem = memo(MessageItem);

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  streamingMessage?: ChatMessage;
  onDelete?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isStreaming, 
  streamingMessage,
  onDelete,
  onEdit 
}) => {
  const { state } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const currentMessageCount = state.currentChat?.messages?.length || 0;
    // Only scroll if new messages were added
    if (currentMessageCount > previousMessageCount.current) {
      scrollToBottom();
    }
    previousMessageCount.current = currentMessageCount;
  }, [state.currentChat?.messages, scrollToBottom]);

  // Only log on significant changes
  useEffect(() => {
    const messageCount = state.currentChat?.messages?.length || 0;
    const messagesWithAttachments = state.currentChat?.messages?.filter(
      (msg: ChatMessage) => (msg.metadata?.attachments ?? []).length > 0
    ).length || 0;

    if (messageCount !== previousMessageCount.current) {
      console.log('Messages: Rendering message list', {
        messageCount,
        messagesWithAttachments
      });
    }
  }, [state.currentChat?.messages]);

  if (!state.currentChat?.messages) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message: ChatMessage) => (
        <MemoizedMessageItem 
          key={message.id} 
          message={message}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export { MessageList }; 