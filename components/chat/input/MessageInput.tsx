import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { useChatMessage } from '@/lib/features/chat/hooks/useChatMessage';
import { useChatSidebar } from '@/lib/features/chat/hooks/useChatSidebar';
import { useMessageInput } from '@/lib/features/chat/hooks/useMessageInput';

// Add onMessageSubmit prop
interface MessageInputProps {
  onMessageSubmit: (message: string) => void;
}

export function MessageInput({ onMessageSubmit }: MessageInputProps) {
  const { handleMessage, error, setError } = useChatMessage();
  const { 
    createNewChat, 
    currentChat, 
    model, 
    dominationField,
    setCurrentChat 
  } = useChatSidebar();

  const {
    files,
    isLoading,
    textareaRef,
    fileInputRef,
    handleKeyDown,
    handleFileSelect,
    handleRemoveFile
  } = useMessageInput({
    handleMessage,
    isLoading: false,
    currentChat,
    createNewChat,
    updateCurrentChat: setCurrentChat,
    model,
    dominationField,
    setError
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    console.log('1. MessageInput: Starting to send message:', content);
    console.log('2. Current chat state:', currentChat);
    
    // Show message immediately
    onMessageSubmit(content);
    console.log('3. Message submitted to ChatArea');
    
    // Clear input
    if (textareaRef.current) {
      textareaRef.current.value = '';
      console.log('4. Input cleared');
    }

    // Process message in background
    try {
      console.log('5. Starting handleMessage');
      await handleMessage(content);
      console.log('6. Message processed successfully');
    } catch (error) {
      console.error('7. Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center relative">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white ml-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Textarea
            ref={textareaRef}
            placeholder="Type your message..."
            className="min-h-[80px] w-full bg-transparent border-0 focus:ring-0 text-white resize-none px-2 pr-16"
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          <Button
            size="sm"
            className="text-white bg-blue-600 hover:bg-blue-700 absolute right-2 top-[50%] transform -translate-y-[50%]"
            onClick={() => handleSendMessage(textareaRef.current?.value || '')}
            disabled={isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
              <span>{file.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white p-1 h-auto"
                onClick={() => handleRemoveFile(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
} 
