import { useCallback, useState, useRef, useEffect } from 'react';
import { useChat } from './useChat';
import { handleStreamingResponse } from '@/lib/utils/streaming';
import { MessageFactory } from '@/lib/features/chat/factories/MessageFactory';
import { ChatStorageManager } from '../utils/ChatStorageManager';
import { handleError, handleStreamError } from '@/lib/utils/error';

export function useChatMessage() {
  const { 
    sendMessage, 
    currentChat,
    setStreamingMessage,
    model,
    dominationField,
    updateCurrentChat,
    isLoading,
    updateChatName
  } = useChat();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const chatIdRef = useRef<string | null>(null);
  const currentChatRef = useRef(currentChat);
  const loadingRef = useRef(isLoading);
  const streamingContentRef = useRef('');
  const currentModelRef = useRef(model);

  useEffect(() => {
    currentModelRef.current = model;
  }, [model]);

  useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(() => {
    if (!loadingRef.current && currentChat?.id) {
      console.log('🔗 [useChatMessage] Syncing chat ID:', currentChat.id);
      chatIdRef.current = currentChat.id;
    }
  }, [currentChat?.id, isLoading]);

  const handleMessage = useCallback(async (content: string) => {
    if (loadingRef.current || processingRef.current || !content.trim()) {
      return;
    }

    const chatId = currentChatRef.current?.id || chatIdRef.current;
    if (!chatId) return;

    try {
      processingRef.current = true;
      setIsProcessing(true);
      setError(null);
      setStreamingMessage('');
      streamingContentRef.current = '';

      localStorage.setItem('selectedModel', currentModelRef.current);
      localStorage.setItem('selectedDomField', dominationField);

      const messagePairId = crypto.randomUUID();
      let initialMessage = MessageFactory.createUserMessage(content, chatId, {
        model: currentModelRef.current,
        dominationField,
        messagePairId,
        customPrompt: currentChat?.customPrompt ?? null
      });

      await updateCurrentChat(prev => ({
        ...prev!,
        model: currentModelRef.current,
        dominationField,
        customPrompt: currentChat?.customPrompt ?? null,
        messages: [...(prev?.messages || []), initialMessage]
      }));

      const currentMessages = currentChatRef.current?.messages || [];
      if (currentMessages.length === 0) {
        await updateChatName(chatId, content.slice(0, 30));
      }

      try {
        const { response } = await sendMessage(content, chatId);
        let fullResponse = '';
        let hasError = false;

        await handleStreamingResponse(response, {
          onToken: async (token: string) => {
            if (hasError) return;
            
            try {
              setStreamingMessage(prev => prev + token);
              fullResponse += token;
              streamingContentRef.current = fullResponse;

              const streamingMessage = MessageFactory.createAssistantMessage(
                initialMessage,
                fullResponse,
                { 
                  status: 'sending',
                  model: currentModelRef.current,
                  isStreaming: true,
                  temporary: true,
                  customPrompt: currentChat?.customPrompt ?? null
                }
              );

              await updateCurrentChat(prev => {
                if (!prev) return prev;
                const messages = Array.isArray(prev.messages) ? prev.messages : [];
                const lastMessageIndex = messages.length - 1;
                
                if (messages[lastMessageIndex]?.messagePairId === messagePairId) {
                  messages[lastMessageIndex] = streamingMessage;
                }
                
                return { ...prev, messages };
              });
            } catch (tokenError) {
              console.error('Error processing token:', tokenError);
              hasError = true;
              throw tokenError;
            }
          },
          onComplete: async () => {
            if (hasError) return;

            try {
              if (!fullResponse.trim()) {
                throw new Error('Empty response received');
              }

              const completeMessage = MessageFactory.createAssistantMessage(
                initialMessage,
                fullResponse,
                { 
                  status: 'success',
                  model: currentModelRef.current,
                  customPrompt: currentChat?.customPrompt ?? null
                }
              );
              
              setStreamingMessage('');
              streamingContentRef.current = '';
              
              await updateCurrentChat(prev => {
                if (!prev) return prev;
                const messages = Array.isArray(prev.messages) ? prev.messages : [];
                const messageIndex = messages.findIndex(
                  msg => msg.messagePairId === messagePairId
                );

                if (messageIndex !== -1) {
                  messages[messageIndex] = completeMessage;
                }

                return { ...prev, messages: [...messages] };
              });
            } catch (completeError) {
              hasError = true;
              throw completeError;
            }
          },
          onError: async (error: Error) => {
            hasError = true;
            console.error('💥 [useChatMessage] Stream error:', error);
            const failedMessage = MessageFactory.createFailedMessage(
              initialMessage, 
              error.message || 'Stream processing failed'
            );
            
            setStreamingMessage('');
            streamingContentRef.current = '';
            
            await updateCurrentChat(prev => ({
              ...prev!,
              messages: prev!.messages.map(msg => 
                msg.messagePairId === messagePairId ? failedMessage : msg
              )
            }));

            setError(error.message);
          }
        });
      } catch (error) {
        console.error('💥 [useChatMessage] Message handling error:', error);
        handleError(error, setError);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const failedMessage = MessageFactory.createFailedMessage(initialMessage, errorMessage);
        
        await updateCurrentChat(prev => ({
          ...prev!,
          messages: prev!.messages.map(msg => 
            msg.messagePairId === messagePairId ? failedMessage : msg
          )
        }));
      }
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [currentChat, model, dominationField, sendMessage, setStreamingMessage, updateCurrentChat, updateChatName]);

  return {
    handleMessage,
    isProcessing,
    error,
    setIsProcessing
  };
} 