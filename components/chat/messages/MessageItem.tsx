'use client';

import { memo, useMemo } from 'react';
import type { ChatMessage } from '@/lib/types/chat';
import type { ChatAttachment } from '@/lib/services/ChatAttachmentService';
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
  // Memoize the message content to prevent unnecessary re-renders
  const assistantContent = useMemo(() => message.assistantContent?.trim() || '', [message.assistantContent]);
  const userContent = useMemo(() => message.userContent?.trim() || '', [message.userContent]);
  const shouldShowAssistant = (assistantContent && assistantContent.length > 0) || isStreaming || message.status === 'streaming';
  const hasAttachments = (message.metadata?.attachments?.length ?? 0) > 0;

  // Render both user and assistant messages
  return (
    <>
      {/* User message */}
      {userContent && userContent.length > 0 && (
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
              {userContent}
            </div>

            {/* User message attachments */}
            {hasAttachments && (
              <div className="flex flex-wrap gap-4 mt-4">
                {message.metadata?.attachments?.map((attachment: ChatAttachment) => (
                  <div 
                    key={attachment.id}
                    className="relative group"
                  >
                    {attachment.fileType.startsWith('image/') ? (
                      <a 
                        href={`/api/chat/attachments/${attachment.id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={`/api/chat/attachments/${attachment.id}/preview`}
                          alt={attachment.fileName}
                          className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                        />
                      </a>
                    ) : (
                      <a
                        href={`/api/chat/attachments/${attachment.id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm truncate max-w-[150px]">
                          {attachment.fileName}
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
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
      {shouldShowAssistant && (
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
              {assistantContent}
              {(isStreaming || message.status === 'streaming') && assistantContent.length > 0 && (
                <StreamingIndicator className="inline-block ml-1" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}); 