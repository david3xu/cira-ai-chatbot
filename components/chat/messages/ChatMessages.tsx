import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { useChat } from '@/lib/features/chat/hooks/useChat';
import { ChatMessage } from '@/lib/types/chat/chat';
import { MessageFactory } from '@/lib/features/chat/factories/MessageFactory';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  streamingMessage: string;
  pendingMessage: {
    content: string;
    message: ChatMessage;
  } | null;
}

export function ChatMessages({
  messages,
  isLoading,
  error,
  streamingMessage,
  pendingMessage
}: ChatMessagesProps) {
  const { currentChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    if (messages.length !== prevMessagesLengthRef.current || streamingMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length, streamingMessage]);

  if (!currentChat) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.messagePairId}
          message={message}
          isStreaming={false}
        />
      ))}
      
      {streamingMessage && (
        <MessageBubble
          message={{
            ...MessageFactory.createAssistantMessage(
              MessageFactory.createUserMessage(
                streamingMessage,
                currentChat.id,
                {
                  model: currentChat.model,
                  dominationField: currentChat.dominationField,
                  messagePairId: `streaming-${Date.now()}`
                }
              ),
              streamingMessage,
              {
                status: 'success',
                model: currentChat.model
              }
            ),
            temporary: true
          }}
          isStreaming={true}
        />
      )}
      
      {pendingMessage && (
        <MessageBubble
          message={pendingMessage.message}
          isStreaming={false}
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
} 