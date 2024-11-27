import { ChatMessage } from '@/lib/types/chat/chat';
import { cn } from '@/lib/utils/utils';
import { MessageContent } from './MessageContent';
import { User, Bot } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { memo } from 'react';

interface MessageBubbleProps {
  message: ChatMessage;
  className?: string;
  isStreaming?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  className,
  isStreaming = false
}: MessageBubbleProps) {
  const isUser = message.userRole === 'user';
  const content = isUser ? message.userContent : message.assistantContent;

  return (
    <div 
      className={cn(
        'group relative flex gap-3',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <User className="h-6 w-6 text-gray-400" />
        ) : (
          <Bot className="h-6 w-6 text-blue-400" />
        )}
      </div>

      <div
        className={cn(
          'flex-1 rounded-lg px-4 py-2',
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-100',
          isStreaming && 'animate-pulse'
        )}
      >
        {message.imageUrl && (
          <div className="mb-2">
            <Image
              src={message.imageUrl}
              alt="Uploaded image"
              width={300}
              height={200}
              className="rounded-lg"
            />
          </div>
        )}

        <MessageContent content={content} />

        {message.createdAt && (
          <div className="mt-1 text-xs text-gray-400">
            {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
          </div>
        )}

        {message.temporary && (
          <div className="mt-1 text-xs opacity-70">
            {message.temporary ? 'Failed to send' : 'Sending...'}
          </div>
        )}

        {isStreaming && (
          <span className="inline-block animate-pulse ml-1">▊</span>
        )}
      </div>
    </div>
  );
}); 