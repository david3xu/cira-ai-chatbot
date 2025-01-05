"use client"

import { memo } from 'react';
import { ChatMessage } from '@/lib/types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  streamingMessage?: ChatMessage;
  onDelete?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
}

export const MessageList = memo(function MessageList({ 
  messages, 
  isStreaming, 
  streamingMessage,
  onDelete,
  onEdit 
}: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
      {isStreaming && streamingMessage && (
        <MessageItem 
          key="streaming" 
          message={streamingMessage} 
          isStreaming={true}
        />
      )}
    </div>
  );
}); 