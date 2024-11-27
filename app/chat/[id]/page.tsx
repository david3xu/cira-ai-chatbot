'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat } from '@/lib/features/chat/hooks/useChat';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import SharedLayout from '@/components/chat/layout/SharedLayout';
import { ChatArea } from '@/components/chat/area/ChatArea';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Chat } from '@/lib/types/chat/chat';
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
        
        // Get both localStorage and sessionStorage states
        const localChat = localStorage.getItem(`chat_${params.id}`);
        const sessionChat = sessionStorage.getItem(`chat_${params.id}`);
        const persistedChat = sessionChat || localChat;
        const chatState = persistedChat ? JSON.parse(persistedChat) : null;
        
        // Load chat from API
        const loadedChat = await loadChat(params.id as string);
        
        if (loadedChat) {
          // Merge states, prioritizing persisted messages
          const updatedChat = {
            ...loadedChat,
            messages: [...(chatState?.messages || []), ...(loadedChat.messages || [])]
          };
          
          // Update both storages and state atomically
          ReactDOM.unstable_batchedUpdates(() => {
            updateCurrentChat(() => updatedChat);
            localStorage.setItem(`chat_${params.id}`, JSON.stringify(updatedChat));
            sessionStorage.setItem(`chat_${params.id}`, JSON.stringify(updatedChat));
            loadedRef.current = true;
          });
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

  useEffect(() => {
    const syncState = async () => {
      if (!params?.id) return;
      
      try {
        // Load chat from API
        const loadedChat = await loadChat(params.id as string);
        
        if (loadedChat) {
          // Update localStorage with new chat
          const existingChats = JSON.parse(localStorage.getItem('chats') || '[]');
          const updatedChats = existingChats.map((chat: Chat) => 
            chat.id === loadedChat.id ? loadedChat : chat
          );
          
          if (!existingChats.find((chat: Chat) => chat.id === loadedChat.id)) {
            updatedChats.push(loadedChat);
          }
          
          localStorage.setItem('chats', JSON.stringify(updatedChats));
          dispatch({ type: 'SET_CHATS', payload: updatedChats });
        }
      } catch (error) {
        console.error('Error syncing state:', error);
      }
    };

    syncState();
  }, [params?.id, dispatch]);

  if (isLoading) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
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
