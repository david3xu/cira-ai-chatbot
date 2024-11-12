'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/components/ChatContext';
import SharedLayout from '@/components/SharedLayout';
import { ChatArea } from '@/components/chatArea/ChatArea';
import MessageInput from '@/components/message-input';
import { Chat } from '@/lib/chat';
import React from 'react';

// Add Error Boundary Component
class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SharedLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-gray-600">Please refresh the page to try again</p>
            </div>
          </div>
        </SharedLayout>
      );
    }

    return this.props.children;
  }
}

const ChatPage = () => {
  const params = useParams();
  const id = params.id as string;
  const { setCurrentChat, loadChatHistory, chats } = useChat();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChat = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const cachedChat = localStorage.getItem(`chat_${id}`);
          if (cachedChat) {
            setCurrentChat(JSON.parse(cachedChat));
          }
          
          const existingChat = chats.find(chat => chat.id === id);
          if (existingChat && !existingChat.historyLoaded) {
            await loadChatHistory(id);
          } else if (!existingChat) {
            const newChat: Chat = {
              id,
              messages: [],
              historyLoaded: true,
              name: 'New Chat',
              dominationField: localStorage.getItem('dominationField') || 'Normal Chat',
            };
            setCurrentChat(newChat);
            localStorage.setItem(`chat_${id}`, JSON.stringify(newChat));
          }
        } catch (error) {
          console.error("Error loading chat:", error);
          const cachedChat = localStorage.getItem(`chat_${id}`);
          if (cachedChat) {
            setCurrentChat(JSON.parse(cachedChat));
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadChat();
  }, [id, setCurrentChat, loadChatHistory, chats]);

  if (isLoading) {
    return <SharedLayout><div>Loading...</div></SharedLayout>;
  }

  return (
    <SharedLayout>
      <ChatArea />
      <MessageInput />
    </SharedLayout>
  );
};

// Wrap ChatPage with ErrorBoundary
export default function ChatPageWrapper() {
  return (
    <ChatErrorBoundary>
      <ChatPage />
    </ChatErrorBoundary>
  );
}
