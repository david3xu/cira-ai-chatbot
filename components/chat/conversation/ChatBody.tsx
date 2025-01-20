/**
 * ChatBody Component
 * 
 * Chat interface container that provides:
 * - Message list display
 * - Streaming message support
 * - Loading states
 * - Error handling
 */

'use client';

import React, { useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { MessageList } from '../messages/Messages';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { useChatMessage } from '@/lib/hooks/chat/useChatMessage';
import { ChatMessage } from '@/lib/types';

export const ChatBody = memo(function ChatBody() {
  const { state } = useChatContext();
  const { isStreaming, updateMessage, deleteMessage } = useChatMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const lastContentRef = useRef('');
  
  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => {
    const currentMessages = state.currentChat?.messages || state.messages || [];
    
    // Log current messages state
    console.log('💬 ChatBody: Current messages state', {
      totalMessages: currentMessages.length,
      messagesWithAttachments: currentMessages.filter(msg => (msg.metadata?.attachments?.length ?? 0) > 0).length,
      chatId: state.currentChat?.id
    });

    return currentMessages;
  }, [state.currentChat?.messages, state.messages]);

  // Find the last message that's being streamed to
  const streamingMessageBase = useMemo(() => {
    if (!isStreaming || !state.streamingMessageId) return undefined;
    const message = messages.find(msg => msg.id === state.streamingMessageId);
    
    // Log streaming message base
    console.log('🔄 ChatBody: Streaming message base', {
      found: !!message,
      messageId: state.streamingMessageId,
      hasAttachments: (message?.metadata?.attachments?.length ?? 0) > 0,
      attachments: message?.metadata?.attachments
    });

    return message;
  }, [isStreaming, state.streamingMessageId, messages]);

  // Create a streaming message object when streaming
  const streamingMessage = useMemo(() => {
    if (!state.streamingMessage?.trim() || !streamingMessageBase) return undefined;

    // Create a new message object that preserves the original message's metadata and attachments
    const message = {
      ...streamingMessageBase,
      assistantContent: state.streamingMessage.trim(),
      status: 'streaming',
      updatedAt: new Date().toISOString(),
      streaming: {
        isActive: true,
        startedAt: new Date().toISOString()
      }
    } as ChatMessage;

    // Log streaming message creation
    console.log('🎯 ChatBody: Created streaming message', {
      messageId: message.id,
      hasAttachments: (message.metadata?.attachments?.length ?? 0) > 0,
      attachments: message.metadata?.attachments,
      content: message.assistantContent.slice(0, 100) + '...',
      isStreaming: message.streaming?.isActive
    });

    return message;
  }, [state.streamingMessage, streamingMessageBase]);

  // Track content changes and scroll accordingly
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const currentContent = lastMessage?.assistantContent || '';
    const hasNewMessage = messages.length > prevMessagesLengthRef.current;
    const hasNewContent = currentContent !== lastContentRef.current;
    const hasAttachments = (lastMessage?.metadata?.attachments?.length ?? 0) > 0;
    const forceScroll = hasAttachments && messages.length > 0;
    const isActivelyStreaming = isStreaming && lastMessage?.status === 'streaming';

    // Log scroll trigger conditions
    console.log('🔄 ChatBody: Scroll conditions', {
      hasNewMessage,
      hasNewContent,
      isStreaming,
      isActivelyStreaming,
      hasAttachments,
      forceScroll,
      currentContent: currentContent.slice(-50),
      lastContent: lastContentRef.current.slice(-50),
      shouldScroll: hasNewMessage || hasNewContent || forceScroll || isActivelyStreaming,
      messageStatus: lastMessage?.status
    });

    // Always scroll when there's new content or streaming
    const shouldScroll = hasNewMessage || hasNewContent || forceScroll || isActivelyStreaming;

    if (shouldScroll && messagesEndRef.current) {
      // Immediate scroll for streaming, smooth scroll otherwise
      const scrollBehavior: ScrollBehavior = isActivelyStreaming ? 'auto' : 'smooth';
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: scrollBehavior,
          block: 'end'
        });
        
        // Double-check scroll position after a short delay
        setTimeout(() => {
          const isAtBottom = Math.abs(
            (messagesEndRef.current?.getBoundingClientRect().bottom || 0) - 
            window.innerHeight
          ) < 10;
          
          if (!isAtBottom) {
            messagesEndRef.current?.scrollIntoView({
              behavior: 'auto',
              block: 'end'
            });
          }
        }, 100);
      });
    }

    // Update refs after scroll check
    prevMessagesLengthRef.current = messages.length;
    lastContentRef.current = currentContent;
  }, [messages, isStreaming]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleDelete = useCallback((message: ChatMessage) => {
    deleteMessage(message.messagePairId);
  }, [deleteMessage]);

  const handleEdit = useCallback((message: ChatMessage) => {
    updateMessage(message.messagePairId, { status: 'sending' });
  }, [updateMessage]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col min-h-full p-4">
        <div className="flex-1">
          <MessageList 
            messages={messages}
            isStreaming={isStreaming}
            streamingMessage={streamingMessage}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
        <div ref={messagesEndRef} className="h-[1px]" />
      </div>
    </div>
  );
}); 