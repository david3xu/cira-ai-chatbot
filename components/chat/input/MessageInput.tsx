import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useChat } from '@/lib/features/chat/hooks';
import { useChatMessage } from '@/lib/features/chat/hooks/useChatMessage';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Paperclip } from 'lucide-react';
import { ChatService } from '@/lib/services/chat/ChatService';
import { useRouter } from 'next/navigation';
import { MessageFactory } from '@/lib/features/chat/factories/MessageFactory';
import { DOMINATION_FIELDS } from '@/lib/features/ai/config/constants';

interface MessageInputProps {
  onMessageSubmit: (content: string, currentStates: any) => Promise<void>;
  error: string | null;
  isLoading?: boolean;
}

export function MessageInput({ onMessageSubmit, error: parentError, isLoading }: MessageInputProps) {
  const router = useRouter();
  const { 
    currentChat,
    model, 
    dominationField,
    updateCurrentChat,
    setProcessing
  } = useChat();

  const { handleMessage: handleChatMessage } = useChatMessage();
  
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const processingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const createNewChat = async (content: string) => {
    try {
      console.log('🎯 [MessageInput] Creating new chat with:', { 
        model, 
        dominationField,
        content 
      });

      const newChat = await ChatService.createFromMessage(content, {
        model: model || 'null',
        dominationField: dominationField || DOMINATION_FIELDS.NORMAL_CHAT,
        source: 'input',
        metadata: {
          source: 'message_input',
          initialMessage: content
        },
        customPrompt: currentChat?.customPrompt || null
      });

      console.log('✅ [MessageInput] New chat created:', {
        id: newChat.id,
        model: newChat.model,
        dominationField: newChat.dominationField
      });

      return newChat;
    } catch (error) {
      console.error('❌ [MessageInput] Error creating chat:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (processingRef.current || !content.trim() || isLoading) {
      return;
    }

    const messageContent = content.trim();
    const currentStates = {
      model,
      dominationField,
      customPrompt: currentChat?.customPrompt
    };

    setMessage('');
    setFiles([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      processingRef.current = true;
      setProcessing(true);

      // If we're on the home page or don't have a current chat, create a new one
      if (!currentChat?.id) {
        const newChat = await createNewChat(messageContent);
        await updateCurrentChat(() => newChat);
        router.push(`/chat/${newChat.id}`);
      }

      await onMessageSubmit(messageContent, currentStates);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message);
    }
  }, [message]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage(message);
      }}
      className="relative w-full max-w-3xl mx-auto px-4 pb-4"
    >
      <div className="relative flex items-end bg-gray-800 rounded-lg p-2 group focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-200">
        <div className="flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-gray-700 rounded-lg"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
        </div>

        <div className="flex-1 mx-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Type a message..."
            rows={1}
            className="min-h-[44px] w-full resize-none bg-transparent border-0 focus:ring-0 text-white placeholder-gray-400"
          />
        </div>

        <div className="flex-shrink-0">
          <Button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-700 rounded px-2 py-1">
              <span className="text-sm text-white">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {parentError && (
        <div className="text-red-500 text-sm mt-2">
          {parentError}
        </div>
      )}
    </form>
  );
} 
