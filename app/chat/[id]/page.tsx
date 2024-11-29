'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat } from '@/lib/features/chat/hooks/useChat';
import { useChatContext } from '@/lib/features/chat/context/useChatContext';
import SharedLayout from '@/components/chat/layout/SharedLayout';
import { ChatArea } from '@/components/chat/area/ChatArea';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import ReactDOM from 'react-dom';

const ChatErrorFallback = ({ error }: { error: Error }) => (
  <SharedLayout>
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600">Please refresh the page to try again</p>
      </div>
    </div>
  </SharedLayout>
);

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useChatContext();
  const { loadChat, currentChat, updateCurrentChat } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const initializeChat = async () => {
      if (!params?.id || loadedRef.current) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Get persisted chat state
        const persistedChat = sessionStorage.getItem(`chat_${params.id}`);
        const chatState = persistedChat ? JSON.parse(persistedChat) : null;
        
        if (chatState) {
          // Use persisted state immediately
          ReactDOM.unstable_batchedUpdates(() => {
            updateCurrentChat(() => chatState);
            loadedRef.current = true;
            setIsLoading(false);
          });
          return;
        }

        // Load from API if no persisted state
        const loadedChat = await loadChat(params.id as string);
        if (loadedChat) {
          ReactDOM.unstable_batchedUpdates(() => {
            updateCurrentChat(() => loadedChat);
            sessionStorage.setItem(`chat_${params.id}`, JSON.stringify(loadedChat));
            loadedRef.current = true;
          });
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Error loading chat:', err);
        setError('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [params?.id]);

  return (
    <ErrorBoundary FallbackComponent={ChatErrorFallback}>
      <SharedLayout>
        <ChatArea />
      </SharedLayout>
    </ErrorBoundary>
  );
}
