"use client";

import React, { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useChatMessage } from '@/lib/hooks/chat/useChatMessage';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { useDomainContext } from '@/lib/hooks/domain/useDomainContext';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { ChatOptions, Chat, ChatMessage } from '@/lib/types';
import { AttachmentButton } from './AttachmentButton';
import type { ChatAttachment } from '@/lib/services/ChatAttachmentService';
import { toast } from 'sonner';

interface APIResponse<T> {
  data: T | null;
  error: { message: string; status: number; } | null;
}

interface ChatInputProps {
  onCreateChat: (options: ChatOptions) => Promise<APIResponse<Chat>>;
}

export const ChatInput = memo(function ChatInput({ onCreateChat }: ChatInputProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [messagePairId, setMessagePairId] = useState<string | undefined>(undefined);
  const { sendMessage } = useChatMessage();
  const { state, dispatch } = useChatContext();
  const domainContext = useDomainContext();
  const { isStreaming } = state;
  const currentChat: Chat | null = state.currentChat;

  const handleAttachment = useCallback((attachment: ChatAttachment) => {
    console.log('ChatInput: Adding attachment', attachment);
    setAttachments(prev => [...prev, attachment]);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && attachments.length === 0) || isStreaming || isSending) return;

    console.log('ChatInput: Submitting message with attachments', { content, attachments });
    const messageContent = content;
    setContent('');
    
    try {
      setIsSending(true);
      
      let chatToUse = currentChat;
      
      if (!chatToUse) {
        const newChatOptions = {
          model: domainContext.state.selectedModel || 'llava:latest',
          name: 'New Chat',
          dominationField: domainContext.state.dominationField || 'NORMAL_CHAT',
          customPrompt: state.customPrompt || undefined,
          hasCustomPrompt: !!state.customPrompt
        };
        
        try {
          const response = await onCreateChat(newChatOptions);
          
          if (response?.error) {
            console.error('ChatInput: API error:', response.error);
            throw new Error(response.error.message || 'Failed to create new chat');
          }
          
          const apiResponse = response?.data as unknown as {
            chatId: string;
            model: string;
            dominationField: string;
            hasCustomPrompt: boolean;
          };
          
          if (!apiResponse?.chatId) {
            console.error('ChatInput: Invalid chat response:', apiResponse);
            throw new Error('Failed to create new chat: Missing chat ID');
          }
          
          chatToUse = {
            id: apiResponse.chatId,
            name: newChatOptions.name,
            model: apiResponse.model,
            domination_field: apiResponse.dominationField,
            custom_prompt: null,
            metadata: {},
            messages: [],
            userId: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Chat;
          
          localStorage.setItem('selectedDominationField', newChatOptions.dominationField);
          
          dispatch({ type: 'INITIALIZE_CHAT', payload: chatToUse });
          dispatch({ type: 'SET_CURRENT_CHAT', payload: chatToUse });
          
          router.push(`/chat/${chatToUse.id}`);
        } catch (error) {
          console.error('Failed to create chat:', error);
          toast.error('Failed to create new chat');
          return;
        }
      }

      // Send message with attachments in metadata
      const metadata = attachments.length > 0 ? { attachments } : undefined;
      console.log('ChatInput: Sending message with metadata', { metadata });
      
      await sendMessage(messageContent, { metadata });

      // Clear attachments after successful send
      setAttachments([]);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [content, attachments, isStreaming, isSending, currentChat, domainContext.state.selectedModel, 
      domainContext.state.dominationField, state.customPrompt, onCreateChat, dispatch, router, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    if (e.target) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  }, []);

  // Generate message pair ID for attachments
  const getMessagePairId = useCallback(() => {
    if (!messagePairId) {
      const newId = crypto.randomUUID();
      setMessagePairId(newId);
      return newId;
    }
    return messagePairId;
  }, [messagePairId]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-2">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 mb-2 bg-gray-800/50 rounded-lg">
          {attachments.map(attachment => (
            <div 
              key={attachment.id}
              className="relative group"
            >
              {attachment.fileType.startsWith('image/') ? (
                <img 
                  src={`/api/chat/attachments/${attachment.id}/preview`}
                  alt={attachment.fileName}
                  className="w-20 h-20 object-cover rounded-md"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-md">
                  <span className="text-sm truncate max-w-[150px]">
                    {attachment.fileName}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                className="absolute top-1 right-1 p-1 bg-gray-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="sr-only">Remove attachment</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 w-full">
        <AttachmentButton 
          messageId={messagePairId} 
          onAttach={handleAttachment} 
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent border rounded-lg p-2",
            "focus:outline-none focus:ring-1 focus:ring-blue-500",
            "placeholder:text-gray-400"
          )}
          disabled={isStreaming || isSending}
        />
        <button
          type="submit"
          disabled={(!content.trim() && attachments.length === 0) || isStreaming || isSending}
          className={cn(
            "p-2 rounded-lg",
            "hover:bg-gray-700/50 disabled:hover:bg-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors"
          )}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}); 
