import React from 'react';
import { ChatHistoryDisplayProps } from '../types';
import { MessageBubble } from '../messages/MessageBubble';
import { cn } from '@/lib/utils/styling';
import { AppError } from '@/lib/utils/error';

// Add helper function to format database errors
const formatDatabaseError = (error: unknown) => {
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string };
    switch (dbError.code) {
      case '2D000':
        return 'Database transaction error: The operation could not be completed. Please try again.';
      default:
        return dbError.message;
    }
  }
  return String(error);
};

export const ChatHistoryDisplay: React.FC<ChatHistoryDisplayProps> = ({
  messages,
  streamingMessage,
  isLoading,
  error
}) => {
  console.log('ChatHistoryDisplay render:', {
    messageCount: messages.length,
    hasStreamingMessage: !!streamingMessage,
    isLoading,
    error
  });

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
            messagePairId: `streaming-${Date.now()}`,
            userRole: 'user',
            assistantRole: 'assistant',
            userContent: streamingMessage,
            assistantContent: null,
            chatId: messages[messages.length - 1]?.chatId || 'temp',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dominationField: messages[messages.length - 1]?.dominationField || 'Normal Chat',
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
          <div className="font-medium">
            {formatDatabaseError(error)}
          </div>
          {error && typeof error === 'object' && 'details' in error && (
            <div className="mt-2 text-sm opacity-75 whitespace-pre-wrap">
              {typeof (error as {details: unknown}).details === 'string' 
                ? (error as {details: string}).details
                : JSON.stringify((error as {details: unknown}).details, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 