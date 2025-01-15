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
  const [isUploading, setIsUploading] = useState(false);
  const [messagePairId] = useState<string>(() => crypto.randomUUID());
  const { sendMessage } = useChatMessage();
  const { state, dispatch } = useChatContext();
  const domainContext = useDomainContext();
  const { isStreaming } = state;
  const currentChat: Chat | null = state.currentChat;

  const handleAttachment = useCallback((attachment: ChatAttachment) => {
    console.log('📎 Adding attachment to message:', {
      attachment,
      currentAttachments: attachments.length
    });
    setAttachments(prev => [...prev, attachment]);
  }, [attachments.length]);

  const handleUploadStart = useCallback(() => {
    setIsUploading(true);
  }, []);

  const handleUploadEnd = useCallback(() => {
    setIsUploading(false);
  }, []);

  // Handle pasted files
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    console.log('📋 Paste event detected:', { itemCount: items.length });

    // Convert items to array to fix iteration issue
    const itemsArray = Array.from(items);
    for (const item of itemsArray) {
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // Prevent default paste behavior for images
        
        const file = item.getAsFile();
        if (!file) continue;

        console.log('🖼️ Processing pasted image:', {
          name: file.name,
          type: file.type,
          size: file.size
        });

        // Create a File object with a proper name
        const imageFile = new File(
          [file], 
          `pasted-image-${Date.now()}.${file.type.split('/')[1] || 'png'}`,
          { type: file.type }
        );

        // Convert file to base64
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result?.toString().split(',')[1];
            resolve(base64 || '');
          };
          reader.readAsDataURL(imageFile);
        });

        // Use the existing AttachmentButton's upload functionality
        if (!messagePairId || !currentChat?.id) {
          console.warn('⚠️ No message or chat context for paste');
          toast.error('Please start a chat first');
          return;
        }

        try {
          setIsUploading(true);
          const formData = new FormData();
          formData.append('file', imageFile);
          formData.append('chatId', currentChat.id);
          formData.append('messageId', messagePairId);
          formData.append('metadata', JSON.stringify({ base64Data }));

          const response = await fetch('/api/chat/attachments', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to upload pasted image');
          }

          const result = await response.json();
          if (result.data) {
            // Ensure base64Data is included in the attachment metadata
            const attachment = {
              ...result.data,
              metadata: {
                ...result.data.metadata,
                base64Data
              }
            };
            handleAttachment(attachment);
            toast.success('Image pasted successfully');
          }
        } catch (error) {
          console.error('❌ Failed to process pasted image:', error);
          toast.error('Failed to process pasted image');
        } finally {
          setIsUploading(false);
        }
      }
    }
  }, [currentChat?.id, messagePairId, handleAttachment]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && attachments.length === 0) || isStreaming || isSending) return;

    console.log('ChatInput: Submitting message with attachments', { content, attachments });
    const messageContent = content;
    const messageAttachments = [...attachments];
    
    // Clear both text and attachments immediately
    setContent('');
    setAttachments([]);
    
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
      const metadata = messageAttachments.length > 0 ? { attachments: messageAttachments } : undefined;
      console.log('📤 Sending message with attachments:', {
        messageContent,
        metadata,
        attachmentsCount: messageAttachments.length,
        attachmentDetails: messageAttachments.map(att => ({
          id: att.id,
          fileName: att.fileName,
          fileType: att.fileType
        }))
      });
      
      await sendMessage(messageContent, { metadata });
      console.log('✅ Message sent successfully with attachments');
      
    } catch (error) {
      console.error('❌ Failed to send message with attachments:', error);
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
          chatId={currentChat?.id || ''}
          onAttach={handleAttachment}
          onUploadStart={handleUploadStart}
          onUploadEnd={handleUploadEnd}
        />
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message or paste an image..."
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent border rounded-lg p-2",
            "focus:outline-none focus:ring-1 focus:ring-blue-500",
            "placeholder:text-gray-400",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isStreaming || isSending || isUploading}
        />
        <button
          type="submit"
          disabled={(!content.trim() && attachments.length === 0) || isStreaming || isSending || isUploading}
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
