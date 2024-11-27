import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from './useChat';
import { handleStreamingResponse } from '@/lib/utils/streaming';
import { ChatMessage } from '@/lib/types/chat/chat';
import { ChatService } from '@/lib/services/chat/ChatService';
import ReactDOM from 'react-dom';

export function useChatMessage() {
  const router = useRouter();
  const {
    currentChat,
    createNewChat,
    sendMessage,
    updateCurrentChat,
    setStreamingMessage,
    model,
    dominationField,
    setError,
    error,
    setCurrentChat
  } = useChat();
  const [errorState, setErrorState] = useState<string | null>(null);

  const handleMessage = useCallback(async (
    content: string, 
    chatData?: { 
      chatId: string; 
      model: string; 
      dominationField: string; 
    }
  ) => {
    console.log('handleMessage called with:', {
      content,
      chatData,
      currentChatState: currentChat,
      modelState: model,
      dominationState: dominationField
    });

    // Use passed chat data or current state
    const activeChatId = chatData?.chatId || currentChat?.id;
    const activeModel = chatData?.model || model;
    const activeDomination = chatData?.dominationField || dominationField;

    if (!activeChatId || !activeModel || !activeDomination) {
      throw new Error('Missing required fields: chatId, model, or dominationField');
    }

    const messagePairId = crypto.randomUUID();
    
    try {
      // Create message object
      const userMessage: ChatMessage = {
        id: `${messagePairId}-user`,
        chatId: activeChatId,
        messagePairId,
        userContent: content,
        assistantContent: '',
        userRole: 'user',
        assistantRole: 'assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dominationField: activeDomination,
        model: activeModel,
        metadata: {},
        status: 'sending'
      };

      console.log('Created user message:', userMessage);

      // Update state atomically
      await Promise.all([
        ChatService.storeMessage(userMessage),
        new Promise<void>(resolve => {
          ReactDOM.unstable_batchedUpdates(() => {
            updateCurrentChat(prev => {
              if (!prev) return null;
              const updated = {
                ...prev,
                messages: [...(prev.messages || []), userMessage]
              };
              
              if (prev.id) {
                localStorage.setItem(`chat_${prev.id}`, JSON.stringify(updated));
                sessionStorage.setItem(`chat_${prev.id}`, JSON.stringify(updated));
              }
              
              return updated;
            });
            resolve();
          });
        })
      ]);

      console.log('Current state before updates:', {
        currentChat,
        localStorage: localStorage.getItem(`chat_${activeChatId}`),
        sessionStorage: sessionStorage.getItem(`chat_${activeChatId}`)
      });

      console.log('State after updates:', {
        updatedChat: currentChat,
        localStorage: localStorage.getItem(`chat_${activeChatId}`),
        sessionStorage: sessionStorage.getItem(`chat_${activeChatId}`)
      });

      // Phase 2: Get and save assistant response
      const response = await sendMessage(content, activeChatId);
      let fullResponse = '';

      console.log('Starting streaming response for messageId:', messagePairId);

      await handleStreamingResponse(response, {
        onToken: (token) => {
          console.log('Received token:', { token, currentResponse: fullResponse });
          fullResponse += token;
          setStreamingMessage(prev => {
            const updated = prev + token;
            sessionStorage.setItem(`streaming_${messagePairId}`, updated);
            return updated;
          });
        },
        onComplete: async () => {
          console.log('Streaming complete:', {
            fullResponse,
            messageId: messagePairId,
            chatState: currentChat
          });
          setStreamingMessage('');
          sessionStorage.removeItem(`streaming_${messagePairId}`);
          
          // Update message in database
          await ChatService.updateMessage(messagePairId, {
            assistantContent: fullResponse,
            status: 'success'
          });

          // Update UI state atomically
          ReactDOM.unstable_batchedUpdates(() => {
            updateCurrentChat(prev => {
              if (!prev?.messages) return prev;
              const updatedMessages = prev.messages.map(msg => 
                msg.messagePairId === messagePairId
                  ? { ...msg, assistantContent: fullResponse, status: 'success' as const }
                  : msg
              );
              
              const updatedChat = {
                ...prev,
                messages: updatedMessages
              };
              
              localStorage.setItem(`chat_${prev.id}`, JSON.stringify(updatedChat));
              sessionStorage.setItem(`chat_${prev.id}`, JSON.stringify(updatedChat));
              
              return updatedChat;
            });
          });
        }
      });

    } catch (error) {
      console.error('Message handling error:', error);
      throw error;
    }
  }, [currentChat?.id, model, dominationField]);

  return { handleMessage, error: errorState, setError: setErrorState };
} 