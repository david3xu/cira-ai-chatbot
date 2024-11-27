import React from 'react';
import { ChatHistoryDisplayProps } from '../types';
import { MessageBubble } from '../messages/MessageBubble';
import { cn } from '@/lib/utils/styling';

export const ChatHistoryDisplay: React.FC<ChatHistoryDisplayProps> = ({
  messages,
  streamingMessage,
  isLoading,
  error
}) => {
  return (
    <div className="flex flex-col gap-4">
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={false}
          className={cn(
            'transition-opacity duration-300',
            message.temporary ? 'opacity-70' : 'opacity-100'
          )}
        />
      ))}
      
      {streamingMessage && (
        <MessageBubble
          message={{
            id: 'streaming',
            message_pair_id: `streaming-${Date.now()}`,
            role: 'assistant',
            content: streamingMessage,
            chat_id: messages[messages.length - 1]?.chat_id || 'temp',
            created_at: new Date().toISOString(),
            domination_field: messages[messages.length - 1]?.domination_field || 'Normal Chat',
            model: messages[messages.length - 1]?.model || '',
            temporary: true,
            isStreaming: true
          }}
          isStreaming={true}
          className="animate-fade-in"
        />
      )}

      {isLoading && !streamingMessage && (
        <div className="flex justify-center">
          <div className="animate-pulse text-muted-foreground">
            Loading history...
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}; 