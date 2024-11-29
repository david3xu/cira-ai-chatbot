import React, { useState, useEffect } from 'react';
import { useChat } from '@/lib/features/chat/hooks';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from '../messages/ChatMessages';
import { MessageInput } from '../input/MessageInput';
import { ChatService } from '@/lib/services/chat/ChatService';
import { ChatMessage } from '@/lib/types/chat/chat';

export function ChatArea() {
  const { 
    currentChat, 
    isLoading, 
    error, 
    addMessage,
    updateCurrentChat 
  } = useChat();
  const [showUploader, setShowUploader] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  // Sync messages between local state and chat context
  useEffect(() => {
    if (currentChat?.messages) {
      setLocalMessages(currentChat.messages);
    }
  }, [currentChat?.messages]);

  console.log('ChatArea render:', {
    currentChat,
    hasMessages: currentChat?.messages?.length,
    isLoading,
    error
  });

  const handleNewMessage = async (content: string) => {
    console.log('ChatArea handleNewMessage:', {
      content,
      currentChatId: currentChat?.id
    });

    const messagePairId = crypto.randomUUID();
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: currentChat?.id || '',
      messagePairId,
      userContent: content,
      assistantContent: null,
      userRole: 'user',
      assistantRole: 'assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sending',
      dominationField: currentChat?.dominationField || 'Normal Chat',
      model: currentChat?.model || 'llama3.1'
    };

    // Immediately update local state
    setLocalMessages(prev => [...prev, newMessage]);

    try {
      console.log('Adding message to chat:', newMessage);
      if (!currentChat) {
        const newChat = await ChatService.createChat({
          model: 'llama3.1',
          dominationField: 'Normal Chat',
          source: 'input',
          name: content.slice(0, 30),
          metadata: { initialMessage: content },
          customPrompt: null
        });

        if (newChat) {
          updateCurrentChat(() => ({
            ...newChat,
            messages: [newMessage]
          }));
          newMessage.chatId = newChat.id;
        }
      } else {
        addMessage(newMessage);
      }
      
      // Save message to database
      await ChatService.saveMessage(newMessage);
      
    } catch (error) {
      console.error('Error in handleNewMessage:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        showUploader={showUploader}
        setShowUploader={setShowUploader}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <ChatMessages
            messages={localMessages}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      <div className="flex-shrink-0 w-full">
        <MessageInput onMessageSubmit={handleNewMessage} />
      </div>
    </div>
  );
} 

