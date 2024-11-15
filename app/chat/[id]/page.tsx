'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/components/ChatContext';
import SharedLayout from '@/components/SharedLayout';
import { ChatArea } from '@/components/chatArea/ChatArea';
import MessageInput from '@/components/message-input';
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

export default function ChatPage() {
  const params = useParams();
  const { loadChat, error } = useChat();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const initializeChat = async () => {
      if (!params?.id || isLoading) return;
      
      setIsLoading(true);
      try {
        await loadChat(params.id as string);
      } catch (err) {
        console.error('Error loading chat:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();
    
    return () => {
      mounted = false;
    };
  }, [params?.id, loadChat]);

  if (isLoading) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </SharedLayout>
    );
  }

  if (error) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error loading chat</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <ChatErrorBoundary>
      <SharedLayout>
        <ChatArea />
        <MessageInput />
      </SharedLayout>
    </ChatErrorBoundary>
  );
}
