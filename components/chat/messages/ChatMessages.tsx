import { useChat } from '@/lib/features/chat/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ChatMessage } from '@/lib/types/chat/chat';
import React, { useRef, useEffect } from 'react';

interface ChatMessagesProps {
  messages?: ChatMessage[];
  isLoading?: boolean;
  error?: string | null;
}

export function ChatMessages({ messages, isLoading, error }: ChatMessagesProps) {
  const { streamingMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length, streamingMessage]);

  if (!messages?.length && !streamingMessage) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages?.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          className="max-w-[80%]"
        />
      ))}

      {streamingMessage && (
        <MessageBubble
          message={{
            id: 'streaming',
            chatId: messages?.[0]?.chatId || '',
            messagePairId: 'streaming',
            userContent: '',
            assistantContent: streamingMessage,
            assistantRole: 'assistant',
            userRole: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dominationField: messages?.[0]?.dominationField || '',
            model: messages?.[0]?.model || '',
            isStreaming: true
          }}
          className="max-w-[80%]"
        />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
} 