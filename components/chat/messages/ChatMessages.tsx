import { useChat } from '@/lib/features/chat/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ChatMessage } from '@/lib/types/chat/chat';
import React, { useRef, useEffect } from 'react';

interface ChatMessagesProps {
  messages?: ChatMessage[];
  isLoading?: boolean;
  error?: string | null;
}

export function ChatMessages({ messages: propMessages, isLoading, error }: ChatMessagesProps) {
  const { currentChat, streamingMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Combine prop messages with current chat messages
  const messages = React.useMemo(() => {
    const chatMessages = currentChat?.messages || [];
    const allMessages = [...chatMessages];
    
    // Deduplicate based on messagePairId
    const seen = new Set();
    return allMessages.filter(msg => {
      const duplicate = seen.has(msg.messagePairId);
      seen.add(msg.messagePairId);
      return !duplicate;
    });
  }, [currentChat?.messages, propMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  return (
    <div className="space-y-4">
      {messages.map((message) => (
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
            chatId: currentChat?.id || '',
            messagePairId: 'streaming',
            userContent: '',
            assistantContent: streamingMessage,
            assistantRole: 'assistant',
            userRole: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dominationField: currentChat?.dominationField || '',
            model: currentChat?.model || '',
            isStreaming: true
          }}
          className="max-w-[80%]"
        />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
} 