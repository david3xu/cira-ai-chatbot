import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import { MarkdownUploader } from "@/components/MarkdownUploader";
import { ChatMessages } from './ChatMessages';
import { useChat } from '@/hooks/useChat';
import { ChatAreaProps } from './types';
import { ModelSelector } from '@/components/chatArea/ModelSelector';
import { ChatMessage } from '@/lib/chat';

export const ChatArea: React.FC<ChatAreaProps> = () => {
  const router = useRouter();
  const { chatId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentChat, streamingMessage, isLoading, isLoadingHistory, error, isInitializing } = useChat();

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

  const renderMessages = () => {
    if (isLoadingHistory) {
      return <div className="text-white p-4">Loading chat history...</div>;
    }

    if (!currentChat?.messages?.length && !streamingMessage && !isLoading) {
      return (
        <div className="text-gray-400 text-center p-4">
          Start a conversation by typing a message below.
        </div>
      );
    }

    return (
      <ChatMessages 
        messages={currentChat?.messages || []}
        streamingMessage={streamingMessage}
        isLoading={isLoading}
        error={error}
      />
    );
  };

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
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// Message Bubble Component (can be moved to a separate file)
export const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const renderContent = () => {
    if (typeof message.content === 'string') {
      return message.content;
    }
    // Handle array of MessageContent or complex object by converting to string
    return JSON.stringify(message.content);
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
