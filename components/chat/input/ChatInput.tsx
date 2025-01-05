"use client";

import React, { useState, useCallback, memo } from 'react';
import { useChatMessage } from '@/lib/hooks/chat/useChatMessage';
import { useChatContext } from '@/lib/hooks/chat/useChatContext';
import { useDomainContext } from '@/lib/hooks/domain/useDomainContext';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { ChatOptions, Chat } from '@/lib/types';

interface ChatInputProps {
  onCreateChat: (options: ChatOptions) => Promise<void>;
}

export const ChatInput = memo(function ChatInput({ onCreateChat }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useChatMessage();
  const { state } = useChatContext();
  const domainContext = useDomainContext();
  const { isStreaming } = state;
  const currentChat: Chat | null = state.currentChat;
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isStreaming || isSending) return;

    const messageContent = content;
    setContent('');
    
    try {
      setIsSending(true);
      
      if (!currentChat) {
        const newChatOptions = {
          model: domainContext.state.selectedModel,
          name: 'New Chat',
          dominationField: domainContext.state.dominationField,
          customPrompt: state.customPrompt || undefined
        };
        
        await onCreateChat(newChatOptions);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    
      const activeChat = state.currentChat;
      if (!activeChat?.id) {
        throw new Error('No active chat found');
      }
      
      await sendMessage(messageContent);
    } catch (error) {
      console.error('ChatInput: Failed to send message:', error);
      setContent(messageContent);
    } finally {
      setIsSending(false);
    }
  }, [content, isStreaming, isSending, currentChat, domainContext.state.selectedModel, 
      domainContext.state.dominationField, state.customPrompt, state.currentChat, 
      onCreateChat, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className={cn(
            "w-full min-h-[50px] max-h-[200px] p-4 pr-12",
            "rounded-lg border border-blue-600",
            "bg-gray-900 text-white",
            "resize-none overflow-y-auto",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "placeholder:text-gray-400"
          )}
          disabled={isStreaming || isSending}
        />
        <button 
          type="submit"
          disabled={!content.trim() || isStreaming || isSending}
          className={cn(
            "absolute right-2 p-2 rounded-md",
            "text-white transition-colors",
            "hover:bg-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          aria-label="Send message"
        >
          <Send className={cn(
            "w-5 h-5",
            content.trim() ? "text-blue-500" : "text-gray-400",
            "transition-colors"
          )} />
        </button>
      </div>
    </form>
  );
}); 
