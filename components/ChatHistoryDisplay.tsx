import React from 'react';
import { ChatMessage } from '@/lib/chat';
import { MessageBubble } from '@/components/chatArea/MessageBubble';

interface ChatHistoryDisplayProps {
  chatId?: string;
  messages: ChatMessage[];
  streamingMessage?: string;
  isLoading: boolean;
  error: string | null;
}

export const ChatHistoryDisplay: React.FC<ChatHistoryDisplayProps> = ({
  messages,
  streamingMessage,
  isLoading,
  error
}) => {
  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="chat-messages">
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={false}
        />
      ))}
      
      {streamingMessage && (
        <MessageBubble
          message={{
            id: 'streaming',
            role: 'assistant',
            content: streamingMessage,
            dominationField: messages[messages.length - 1]?.dominationField || '',
            model: messages[messages.length - 1]?.model || '',
          }}
          isStreaming={true}
        />
      )}
      
      {isLoading && !streamingMessage && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};
