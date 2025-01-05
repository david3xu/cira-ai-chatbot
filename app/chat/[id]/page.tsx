'use client'

import { useEffect, useState, useCallback, memo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatSidebar } from '@/lib/hooks/features/useChatSidebar';
import { useModelSelector } from '@/lib/hooks/features/useModelSelector';
import { ChatContainer } from '@/components/chat/conversation/ChatContainer';
import { useChatMessage } from '@/lib/hooks/chat/useChatMessage';
import { DOMINATION_FIELDS, isValidDominationField } from '@/lib/features/ai/config/constants';
import { ChatError, ErrorCodes } from '@/lib/types/errors';
import { useChatContext } from '@/lib/hooks/chat/useChatContext';
import { ChatService } from '@/lib/services/ChatService';

// Configure dynamic routes
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const LoadingState = memo(function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-muted-foreground">Loading chat...</div>
    </div>
  );
});

const ErrorState = memo(function ErrorState({ error }: { error: Error }) {
  const router = useRouter();
  const isNotFound = error instanceof ChatError && error.code === ErrorCodes.NOT_FOUND;

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="text-destructive text-lg">
        {isNotFound ? 'Chat not found' : 'Failed to load chat'}
      </div>
      <div className="text-muted-foreground text-sm">
        {isNotFound ? 'The chat you\'re looking for may have been deleted or never existed.' : 'Please try again later.'}
      </div>
      <button 
        onClick={() => router.push('/')}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Return Home
      </button>
    </div>
  );
});

function useChatInitialization(chatId: string) {
  const { loadChat } = useChatMessage();
  const { selectModel } = useModelSelector();
  const { setDominationField } = useChatSidebar();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initAttemptedRef = useRef(false);
  const { actions } = useChatContext();

  const initializeChat = useCallback(async () => {
    if (!chatId || initAttemptedRef.current) return;
    
    try {
      setError(null);
      setIsLoading(true);
      initAttemptedRef.current = true;
      
      // Load chat list first
      const chats = await ChatService.getAllChats();
      actions.setChats(chats);
      
      // Then load the current chat
      const chat = await loadChat(chatId);
      if (!chat) {
        throw new ChatError('Chat not found', ErrorCodes.NOT_FOUND);
      }
      
      if (chat.model) {
        selectModel(chat.model);
      }
      
      if (chat.domination_field && isValidDominationField(chat.domination_field)) {
        setDominationField(chat.domination_field);
      } else {
        setDominationField(DOMINATION_FIELDS.NORMAL_CHAT);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      setError(error instanceof Error ? error : new Error('Failed to load chat'));
    } finally {
      setIsLoading(false);
    }
  }, [chatId, loadChat, selectModel, setDominationField, actions]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  return { isLoading, error };
}

function ChatPage() {
  const params = useParams();
  const chatIdParam = String(params?.id || '');
  const { isLoading, error } = useChatInitialization(chatIdParam);

  if (!chatIdParam) return null;
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return <ChatContainer chatId={chatIdParam} />;
}

export default memo(ChatPage); 