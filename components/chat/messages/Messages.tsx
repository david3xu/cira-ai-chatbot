"use client"

import { memo, useMemo } from 'react';
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
  // Memoize the message list to prevent unnecessary re-renders
  const messageList = useMemo(() => {
    const list = messages.map((message) => (
      <MessageItem 
        key={message.id} 
        message={message}
        onDelete={onDelete}
        onEdit={onEdit}
        isStreaming={message.status === 'streaming'}
      />
    ));

    // Only add streaming message if it has content
    if (isStreaming && streamingMessage && streamingMessage.assistantContent?.trim()) {
      list.push(
        <MessageItem 
          key="streaming" 
          message={streamingMessage} 
          isStreaming={true}
        />
      );
    }

    return list;
  }, [messages, isStreaming, streamingMessage, onDelete, onEdit]);

  return (
    <div className="space-y-4">
      {messageList}
    </div>
  );
}); 