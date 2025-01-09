"use client";

import React, { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useChatMessage } from '@/lib/hooks/chat/useChatMessage';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { useDomainContext } from '@/lib/hooks/domain/useDomainContext';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import type { ChatOptions, Chat, ChatMessage } from '@/lib/types';

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
  const { sendMessage } = useChatMessage();
  const { state, dispatch } = useChatContext();
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
          
          // Create chat object matching the NewChatButton format
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
          
          // Store the domination field in localStorage (matching NewChatButton)
          localStorage.setItem('selectedDominationField', newChatOptions.dominationField);
          
          // Update chat context
          dispatch({ type: 'INITIALIZE_CHAT', payload: chatToUse });
          dispatch({ type: 'SET_CURRENT_CHAT', payload: chatToUse });
          
          // Update domination field in context (matching NewChatButton)
          dispatch({ type: 'SET_DOMINATION_FIELD', payload: newChatOptions.dominationField });
          
          console.log('ChatInput: Chat created successfully:', {
            id: chatToUse.id,
            model: chatToUse.model,
            dominationField: chatToUse.domination_field
          });
          
          // Create initial message
          const initialMessage = {
            id: crypto.randomUUID(),
            chatId: chatToUse.id,
            messagePairId: crypto.randomUUID(),
            userContent: messageContent,
            assistantContent: '',
            userRole: 'user',
            assistantRole: 'assistant',
            status: 'sending',
            model: chatToUse.model,
            dominationField: chatToUse.domination_field,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {}
          } as ChatMessage;
          
          // Add message to chat
          dispatch({ 
            type: 'ADD_MESSAGE', 
            payload: { 
              message: initialMessage,
              shouldCreateChat: false
            }
          });
          
          // Navigate to chat page
          router.push(`/chat/${chatToUse.id}`);
          
          // Send message after navigation
          await sendMessage(messageContent);
        } catch (error) {
          console.error('ChatInput: Failed to create chat:', error);
          throw error;
        }
      } else {
        // If chat already exists, just send the message
        await sendMessage(messageContent);
      }
    } catch (error) {
      console.error('ChatInput: Failed to send message:', error);
      setContent(messageContent);
    } finally {
      setIsSending(false);
    }
  }, [content, isStreaming, isSending, currentChat, domainContext.state.selectedModel, 
      domainContext.state.dominationField, state.customPrompt, onCreateChat, sendMessage, dispatch, router]);

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
