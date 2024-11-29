import { useCallback, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
import { useChat } from './useChat';
import { handleStreamingResponse } from '@/lib/utils/streaming';
import { ChatMessage } from '@/lib/types/chat/chat';
import { ChatService } from '@/lib/services/chat/ChatService';
import ReactDOM from 'react-dom';
import { useChatContext } from '../context/useChatContext';
import { addMessageToChat, updateMessageInChat } from '../utils/chatState';
import { handleError } from '@/lib/utils/error';

export function useChatMessage() {
  const { dispatch } = useChatContext();
  const {
    currentChat,
    sendMessage,
    updateCurrentChat,
    setStreamingMessage,
    model,
    dominationField,
    setError
  } = useChat();
  const [errorState, setErrorState] = useState<string | null>(null);

  const handleMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    const messagePairId = crypto.randomUUID();

    try {
      // Create message immediately
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        chatId: currentChat?.id || '',
        messagePairId,
        userContent: content.trim(),
        assistantContent: null,
        userRole: 'user',
        assistantRole: 'assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sending',
        dominationField: dominationField || 'Normal Chat',
        model: model || 'llama3.1'
      };

      // Save message immediately
      await ChatService.saveMessage(userMessage);

      // Update UI immediately with batched updates
      ReactDOM.unstable_batchedUpdates(() => {
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        updateCurrentChat(prev => prev && addMessageToChat(prev, userMessage));
      });

      // Process message and handle streaming response
      const response = await sendMessage(content, currentChat?.id || '');
      let fullResponse = '';

      await handleStreamingResponse(response, {
        onToken: (token) => {
          fullResponse += token;
          setStreamingMessage(fullResponse);
        },
        onComplete: async () => {
          setStreamingMessage('');
          
          const completeMessage: ChatMessage = {
            ...userMessage,
            assistantContent: fullResponse,
            status: 'success',
            updatedAt: new Date().toISOString()
          };

          // Update UI and storage
          ReactDOM.unstable_batchedUpdates(() => {
            updateCurrentChat(prev => {
              if (!prev) return prev;
              return updateMessageInChat(prev, messagePairId, completeMessage);
            });
          });

          await ChatService.saveMessage(completeMessage);
        }
      });
    } catch (error) {
      console.error('Error in handleMessage:', error);
      handleError(error, setError);
    }
  }, [currentChat?.id, model, dominationField, sendMessage, updateCurrentChat, setStreamingMessage, dispatch, setError]);

  return { handleMessage, error: errorState, setError: setErrorState };
} 