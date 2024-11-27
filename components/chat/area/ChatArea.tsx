import React, { useState, useEffect } from 'react';
import { useChat } from '@/lib/features/chat/hooks';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from '../messages/ChatMessages';
import { MessageInput } from '../input/MessageInput';

export function ChatArea() {
  const { currentChat, isLoading, error } = useChat();
  const [showUploader, setShowUploader] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarVisible') !== 'false';
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        showUploader={showUploader}
        setShowUploader={setShowUploader}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {currentChat?.messages && currentChat.messages.length > 0 ? (
            <ChatMessages
              messages={currentChat.messages}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 font-medium">
              Start a new conversation
            </div>
          )}
        </div>
      </div>

      {/* Message Input Area */}
      <div className="flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  );
} 
