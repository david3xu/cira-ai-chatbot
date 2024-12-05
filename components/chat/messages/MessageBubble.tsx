import { ChatMessage } from '@/lib/types/chat/chat';
import { cn } from '@/lib/utils/utils';
import { MessageContent } from './MessageContent';
import { User } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { memo } from 'react';

interface MessageBubbleProps {
  message: ChatMessage & { content?: string };
  isStreaming: boolean;
  className?: string;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
  className
}: MessageBubbleProps) {
  if (message.userContent && message.assistantContent) {
    return (
      <>
        {/* User Message */}
        <div 
          className={cn(
            'group relative flex items-start gap-3 px-4 justify-end',
            className
          )}
        >
          <div
            className={cn(
              'flex-1 max-w-[70%] rounded-2xl px-4 py-2 shadow-md',
              'bg-blue-600 text-white rounded-tr-none ml-auto'
            )}
          >
            <MessageContent content={message.userContent} />
            <div className="mt-1 flex items-center justify-between text-xs text-blue-200">
              <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
            </div>
          </div>

          <div className="flex-shrink-0 w-10 h-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 shadow-md">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Assistant Message */}
        <div 
          className={cn(
            'group relative flex items-start gap-3 px-4 justify-start',
            className
          )}
        >
          <div className="flex-shrink-0 w-10 h-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <span className="text-sm font-bold text-white uppercase">CIRA</span>
            </div>
          </div>

          <div
            className={cn(
              'flex-1 max-w-[70%] rounded-2xl px-4 py-2 shadow-md',
              'bg-gray-700 text-gray-100 rounded-tl-none mr-auto',
              isStreaming && 'animate-pulse'
            )}
          >
            <MessageContent content={message.assistantContent} />
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
              {message.model && (
                <span className="px-2 py-0.5 rounded-full bg-gray-600">
                  {message.model}
                </span>
              )}
              {message.dominationField && (
                <span className="px-2 py-0.5 rounded-full bg-gray-600/50">
                  {message.dominationField}
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Single message display
  const isUser = message.userRole === 'user';
  const content = message.content || message.userContent || message.assistantContent;

  return (
    <div 
      className={cn(
        'group relative flex items-start gap-3 px-4',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <span className="text-sm font-bold text-white uppercase">CIRA</span>
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex-1 max-w-[70%] rounded-2xl px-4 py-2 shadow-md',
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none ml-auto'
            : 'bg-gray-700 text-gray-100 rounded-tl-none mr-auto',
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
              priority={true}
              onError={(e) => {
                console.error('Error loading image:', message.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <MessageContent 
          content={content || ''} 
          isStreaming={isStreaming && !isUser}
        />

        <div className={cn(
          "mt-1 flex flex-wrap items-center gap-2 text-xs",
          isUser ? "text-blue-200" : "text-gray-400"
        )}>
          <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
          {!isUser && (
            <>
              {message.model && (
                <span className="px-2 py-0.5 rounded-full bg-gray-600">
                  {message.model}
                </span>
              )}
              {message.dominationField && (
                <span className="px-2 py-0.5 rounded-full bg-gray-600/50">
                  {message.dominationField}
                </span>
              )}
            </>
          )}
        </div>

        {message.temporary && (
          <div className="mt-1 text-xs opacity-70">
            {message.status === 'failed' ? 'Failed to send' : 'Sending...'}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 shadow-md">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}); 