"use client"

import React, { useCallback, useEffect, useRef, memo } from 'react';
import { ChatMessage } from '@/lib/types/chat';
import { MessageItem } from './MessageItem';
import { useChatContext } from '@/lib/features/chat/context/chatContext';

// Memoize individual message items
const MemoizedMessageItem = memo(MessageItem);

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  streamingMessage?: ChatMessage;
  onDelete?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isStreaming, 
  streamingMessage,
  onDelete,
  onEdit 
}) => {
  const { state } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const currentMessageCount = state.currentChat?.messages?.length || 0;
    // Only scroll if new messages were added
    if (currentMessageCount > previousMessageCount.current) {
      scrollToBottom();
    }
    previousMessageCount.current = currentMessageCount;
  }, [state.currentChat?.messages, scrollToBottom]);

  // Enhanced logging for message and attachment tracking
  useEffect(() => {
    const messageCount = state.currentChat?.messages?.length || 0;
    const messagesWithAttachments = state.currentChat?.messages?.filter(
      (msg: ChatMessage) => (msg.metadata?.attachments ?? []).length > 0
    );

    if (messageCount !== previousMessageCount.current) {
      console.log('🔄 Messages: Rendering message list', {
        messageCount,
        messagesWithAttachmentsCount: messagesWithAttachments?.length || 0,
        isStreaming,
        streamingMessageId: streamingMessage?.id
      });

      // Log details of messages with attachments
      if (messagesWithAttachments?.length) {
        console.log('📎 Messages with attachments:', messagesWithAttachments.map(msg => ({
          messageId: msg.id,
          attachmentCount: msg.metadata?.attachments?.length,
          attachments: msg.metadata?.attachments?.map(att => ({
            id: att.id,
            fileName: att.fileName,
            fileType: att.fileType
          }))
        })));
      }

      // Log current messages being rendered
      console.log('📝 Current messages:', messages.map(msg => ({
        id: msg.id,
        hasAttachments: (msg.metadata?.attachments?.length ?? 0) > 0,
        content: msg.userContent || msg.assistantContent,
        metadata: msg.metadata
      })));
    }
  }, [state.currentChat?.messages, isStreaming, streamingMessage, messages]);

  if (!state.currentChat?.messages) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message: ChatMessage) => {   
        return (
          <MemoizedMessageItem 
            key={message.id} 
            message={message}
            onDelete={onDelete}
            onEdit={onEdit}
            isStreaming={isStreaming && message.id === streamingMessage?.id}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export { MessageList }; 