'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat } from '@/lib/features/chat/hooks/useChat';
import SharedLayout from '@/components/chat/layout/SharedLayout';
import { ChatArea } from '@/components/chat/area/ChatArea';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const LoadingState = () => (
  <SharedLayout>
    <div className="flex items-center justify-center h-full">
      <div className="text-white">Loading chat...</div>
    </div>
  </SharedLayout>
);

const ChatErrorFallback = ({ error }: { error: Error }) => (
  <SharedLayout>
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-white">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-400">{error.message}</p>
      </div>
    </div>
  </SharedLayout>
);

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { loadChat, isLoading: chatIsLoading } = useChat();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const initializeChat = async () => {
      const chatId = params?.id;
      if (!chatId || loadedRef.current) return;

      if (typeof chatId !== 'string') {
        setError('Invalid chat ID');
        setPageIsLoading(false);
        return;
      }

      try {
        setPageIsLoading(true);
        const chat = await loadChat(chatId);
        if (!chat) {
          router.push('/');
          return;
        }
        loadedRef.current = true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load chat';
        setError(errorMessage);
        console.error('Error loading chat:', err);
      } finally {
        setPageIsLoading(false);
      }
    };

    initializeChat();
  }, [params?.id, router, loadChat]);

  // Show loading state if either page or chat is loading
  if (pageIsLoading || chatIsLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center h-full text-white">
          Error: {error}
        </div>
      </SharedLayout>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ChatErrorFallback}>
      <SharedLayout>
        <ChatArea />
      </SharedLayout>
    </ErrorBoundary>
  );
}
