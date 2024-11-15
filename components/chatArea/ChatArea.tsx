import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import { MarkdownUploader } from "@/components/MarkdownUploader";
import { ChatMessages } from './ChatMessages';
import { useChat } from '@/hooks/useChat';
import { ChatAreaProps } from './types';
import { ModelSelector } from '@/components/chatArea/ModelSelector';
import { ChatMessage } from '@/lib/chat';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_MODEL } from '@/lib/modelUtils';

export const ChatArea: React.FC<ChatAreaProps> = () => {
  const router = useRouter();
  const { chatId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { initializeChat, currentChat, streamingMessage, isLoading, isLoadingHistory, error, isInitializing, model } = useChat();
  const [persistentMessages, setPersistentMessages] = useState<ChatMessage[]>([]);

  // Add debug logging
  useEffect(() => {
    console.log('ChatArea state:', {
      hasCurrentChat: !!currentChat,
      messageCount: currentChat?.messages?.length,
      messages: currentChat?.messages,
      isLoading,
      isLoadingHistory
    });
  }, [currentChat, isLoading, isLoadingHistory]);

  // Persist UI state
  const [showUploader, setShowUploader] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showUploader') === 'true';
    }
    return false;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, streamingMessage]);

  useEffect(() => {
    localStorage.setItem('showUploader', showUploader.toString());
  }, [showUploader]);

  // Redirect if needed
  useEffect(() => {
    if (currentChat && currentChat.id !== chatId) {
      router.push(`/chat/${currentChat.id}`);
    }
  }, [currentChat, chatId, router]);

  // Add state tracking for message storage
  const [isMessageStored, setIsMessageStored] = useState(false);

  useEffect(() => {
    if (currentChat?.messages) {
      setPersistentMessages(currentChat.messages);
    }
  }, [currentChat?.messages]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
          <div>Initializing chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Model Selector and Uploader Toggle */}
      <div className="flex justify-between items-center p-4 bg-gray-900 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <ModelSelector />
        </div>
        <h1 
          className="text-white text-xl font-semibold cursor-pointer flex items-center gap-2 hover:text-gray-300 transition-colors duration-200" 
          onClick={() => setShowUploader(!showUploader)}
        >
          {showUploader ? (
            <>
              <X className="w-5 h-5" />
              Hide Uploader
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Show Uploader
            </>
          )}
        </h1>
      </div>
      
      {/* Markdown Uploader */}
      {showUploader && (
        <div className="sticky top-[72px] z-10 mb-4 bg-gray-800 rounded-lg p-4">
          <MarkdownUploader />
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentChat ? (
          <ChatMessages 
            messages={persistentMessages}
            streamingMessage={streamingMessage}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <div className="text-gray-400 text-center p-4">
            Welcome! Start a conversation by typing a message below.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// Update the MessageBubble props interface
interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  
  const renderContent = () => {
    console.log('MessageBubble rendering content:', {
      content: message.content,
      type: typeof message.content,
      isStreaming
    });

    if (typeof message.content === 'string') {
      return message.content;
    }
    // Handle array of MessageContent or complex object by converting to string
    const stringified = JSON.stringify(message.content);
    console.log('Stringified content:', stringified);
    return stringified;
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}>
        {renderContent()}
        {message.image && (
          <img src={message.image} alt="Uploaded content" className="mt-2 max-w-full rounded" />
        )}
      </div>
    </div>
  );
};
