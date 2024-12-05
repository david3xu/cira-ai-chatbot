import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useChat } from '@/lib/features/chat/hooks';
import { useChatMessage } from '@/lib/features/chat/hooks/useChatMessage';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from '../messages/ChatMessages';
import { MessageInput } from '../input/MessageInput';
import { handleError } from '@/lib/utils/error';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ChatService } from '@/lib/services/chat/ChatService';
import { MessageFactory } from '@/lib/features/chat/factories/MessageFactory';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/lib/types/chat/chat';
import { fetchChatHistory } from '@/lib/features/chat/actions/fetchHistory';
import { DominationField } from '@/lib/features/ai/config/constants';

const LoadingIndicator = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-white">Loading messages...</div>
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="text-red-500 p-4 text-center">
    <h2>Error:</h2>
    <p>{error}</p>
  </div>
);

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="text-red-500 p-4">
    <h2>Error loading chat:</h2>
    <pre>{error.message}</pre>
  </div>
);

export function ChatArea() {
  const { 
    currentChat, 
    isLoading,
    isProcessing,
    error: chatError,
    streamingMessage,
    model,
    dominationField,
    updateCurrentChat
  } = useChat();

  const {
    handleMessage: handleChatMessage,
    error: messageError
  } = useChatMessage();

  const [showUploader, setShowUploader] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<{
    content: string;
    message: ChatMessage;
  } | null>(null);
  const processedMessageRef = useRef(new Set<string>());
  const messagesRef = useRef<ChatMessage[]>([]);
  const lastUpdateRef = useRef<string>('');
  const isUpdatingRef = useRef(false);

  const router = useRouter();

  // Load messages when chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChat?.id || isUpdatingRef.current) return;

      try {
        isUpdatingRef.current = true;
        const { data: messages, error } = await fetchChatHistory(currentChat.id);
        
        if (error) {
          console.error('Error fetching chat history:', error);
          setLocalError('Failed to load messages');
          return;
        }

        if (!messages) {
          console.warn('No messages returned from fetchChatHistory');
          return;
        }

        // Create a unique key for this update
        const updateKey = messages.map(m => `${m.id}-${m.updatedAt}`).join(',');
        if (updateKey === lastUpdateRef.current) {
          isUpdatingRef.current = false;
          return;
        }
        lastUpdateRef.current = updateKey;

        // Update messages ref
        messagesRef.current = messages;
        
        // Update chat while preserving original message models
        await updateCurrentChat(prev => {
          if (!prev) return prev;
          
          // Ensure messages array exists
          const prevMessages = prev.messages || [];
          
          // Merge new messages with existing ones, preserving original models
          const updatedMessages = messages.map(newMsg => {
            const existingMsg = prevMessages.find(m => m?.id === newMsg.id);
            if (existingMsg) {
              // Keep the original model if message exists
              return {
                ...newMsg,
                model: existingMsg.model
              };
            }
            return newMsg;
          });

          return {
            ...prev,
            messages: updatedMessages
          };
        });
      } catch (error) {
        console.error('Error loading messages:', error);
        setLocalError('Failed to load messages');
      } finally {
        isUpdatingRef.current = false;
      }
    };

    loadMessages();
  }, [currentChat?.id, updateCurrentChat]);

  // Handle message sending and navigation
  const handleNewMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      setLocalError(null);

      if (!currentChat?.id) {
        // Create new chat and navigate
        const newChat = await ChatService.createFromMessage(content, {
          model,
          dominationField
        });
        
        if (!newChat) throw new Error('Failed to create chat');

        // Create initial message
        const initialMessage = MessageFactory.createUserMessage(content, newChat.id, {
          model,
          dominationField,
          messagePairId: crypto.randomUUID()
        });

        // Display message immediately
        setPendingMessage({
          content,
          message: initialMessage
        });

        // Store in session and navigate
        sessionStorage.setItem('pendingMessage', JSON.stringify({
          content,
          chatId: newChat.id,
          timestamp: Date.now(),
          message: initialMessage,
          processed: false
        }));

        router.push(`/chat/${newChat.id}`);
        return;
      }

      // Create and display user message immediately
      const messagePairId = crypto.randomUUID();
      const userMessage = MessageFactory.createUserMessage(content, currentChat.id, {
        model,
        dominationField,
        messagePairId
      });

      // Update UI immediately with user message
      await updateCurrentChat(prev => ({
        ...prev!,
        messages: [...(prev?.messages || []), userMessage]
      }));

      // Handle chat message in background
      await handleChatMessage(content);
      setPendingMessage(null);
    } catch (error) {
      console.error('Error handling message:', error);
      handleError(error, setLocalError);
    }
  }, [currentChat?.id, model, dominationField, handleChatMessage, router, updateCurrentChat]);

  // Handle preserved message state
  useEffect(() => {
    const pendingMessageStr = sessionStorage.getItem('pendingMessage');
    if (pendingMessageStr && currentChat?.id) {
      try {
        const pending = JSON.parse(pendingMessageStr);
        if (pending.chatId === currentChat.id && !pending.processed) {
          if (Date.now() - pending.timestamp < 5 * 60 * 1000) {
            // Check if we've already processed this message
            if (!processedMessageRef.current.has(pending.message.messagePairId)) {
              processedMessageRef.current.add(pending.message.messagePairId);
              
              // Process the message
              handleNewMessage(pending.content);
              
              // Mark as processed
              sessionStorage.setItem('pendingMessage', JSON.stringify({
                ...pending,
                processed: true
              }));
            }
          }
          sessionStorage.removeItem('pendingMessage');
        }
      } catch (error) {
        console.error('Error handling pending message:', error);
        sessionStorage.removeItem('pendingMessage');
      }
    }
  }, [currentChat?.id, handleNewMessage]);

  // Combine all errors for display
  const error = messageError || chatError || localError;

  // Use consolidated loading state
  const isLoadingState = isLoading || isProcessing;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex flex-col h-full">
        <ChatHeader 
          showUploader={showUploader}
          setShowUploader={setShowUploader}
        />

        <div className="flex-1 overflow-y-auto">
          {isLoadingState && !pendingMessage && !messagesRef.current.length ? (
            <LoadingIndicator />
          ) : error ? (
            <ErrorDisplay error={error} />
          ) : (
            <div className="px-4 py-4">
              <ChatMessages
                messages={currentChat?.messages || messagesRef.current}
                isLoading={isLoadingState}
                error={error}
                streamingMessage={streamingMessage}
                pendingMessage={pendingMessage}
              />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 w-full">
          <MessageInput 
            onMessageSubmit={handleNewMessage}
            error={error}
            isLoading={isLoadingState}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
} 

