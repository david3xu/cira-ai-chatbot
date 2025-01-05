'use client';

import { memo } from 'react';
import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils/utils';
import { StreamingIndicator } from '../loading/StreamingIndicator';
import { MessageControls } from './MessageControls';

interface MessageItemProps {
  message: ChatMessage;
  onDelete?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  isStreaming?: boolean;
}

export const MessageItem = memo(function MessageItem({
  message,
  onDelete,
  onEdit,
  isStreaming
}: MessageItemProps) {
  // Render both user and assistant messages
  return (
    <>
      {/* User message */}
      {message.userContent && (
        <div 
          className="flex mb-4 justify-end"
          data-testid={`message-${message.id}-user`}
        >
          <div className={cn(
            'message-content p-4 rounded-lg',
            'bg-blue-600 text-white',
            'ml-auto',
            'max-w-[80%]'
          )}>
            <div className="prose dark:prose-invert max-w-none break-words">
              {message.userContent}
            </div>
          </div>
          {(onDelete || onEdit) && (
            <MessageControls 
              message={message}
              onDelete={() => onDelete?.(message)}
              onEdit={() => onEdit?.(message)}
            />
          )}
        </div>
      )}

      {/* Assistant message */}
      {(message.assistantContent || isStreaming || message.status === 'streaming') && (
        <div 
          className="flex mb-4 justify-start"
          data-testid={`message-${message.id}-assistant`}
        >
          <div className={cn(
            'message-content p-4 rounded-lg',
            'bg-gray-700',
            'mr-auto',
            'max-w-[80%]'
          )}>
            <div className="prose dark:prose-invert max-w-none break-words">
              {message.assistantContent}
              {(isStreaming || message.status === 'streaming') && (
                <StreamingIndicator className="inline-block ml-1" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}); 