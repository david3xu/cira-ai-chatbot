import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ReactDOM from 'react-dom';
import { Chat, CreateNewChatParams } from '@/lib/types/chat/chat';

interface UseMessageInputProps {
  handleMessage: (message: string) => Promise<any>;
  isLoading: boolean;
  currentChat: Chat | null;
  createNewChat: (params: CreateNewChatParams) => Promise<Chat | null>;
  updateCurrentChat: (updater: (prev: Chat | null) => Chat | null) => void;
  model: string;
  dominationField: string;
  setError: (error: string | null) => void;
}

export function useMessageInput({
  handleMessage,
  isLoading: externalIsLoading,
  currentChat,
  createNewChat,
  updateCurrentChat: setCurrentChat,
  model,
  dominationField,
  setError
}: UseMessageInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() && files.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // Create new chat if needed
      if (!currentChat) {
        setIsNavigating(true);
        
        const chatParams: CreateNewChatParams = {
          model: model || 'llama3.1',
          dominationField: dominationField || 'Normal Chat',
          source: 'input',
          name: content.slice(0, 30),
          metadata: {
            source: 'message_input',
            initialMessage: content
          },
          customPrompt: null
        };
        
        const newChat = await createNewChat(chatParams);
        if (!newChat?.id) {
          throw new Error('Failed to create chat');
        }

        // Store chat and wait for state to update
        sessionStorage.setItem('currentChat', JSON.stringify(newChat));
        await router.replace(`/chat/${newChat.id}`, { scroll: false });
        
        // Wait for chat state to be fully updated
        await new Promise<boolean>(resolve => {
          const checkChat = () => {
            if (currentChat && (currentChat as Chat).id === newChat.id) {  
              resolve(true);
            } else {
              setTimeout(checkChat, 50);
            }
          };
          checkChat();
        });
      }

      // Now handle message with updated chat
      await handleMessage(content);
      
      // Clear input after successful send
      setMessage('');
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
      setIsNavigating(false);
    }
  }, [currentChat, model, dominationField, files, createNewChat, handleMessage, router, setError]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(message);
  }, [message, handleSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(textareaRef.current?.value || '');
    }
  }, [handleSendMessage]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle navigation state
  useEffect(() => {
    if (isNavigating) return () => {};
    
    const savedChat = sessionStorage.getItem('currentChat');
    if (savedChat) {
      const chat = JSON.parse(savedChat);
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrentChat(chat);
        sessionStorage.removeItem('currentChat');
      });
    }
  }, [pathname, isNavigating, setCurrentChat]);

  return {
    message,
    setMessage,
    files,
    isLoading: isLoading || externalIsLoading,
    textareaRef,
    fileInputRef,
    handleSendMessage,
    handleSubmit,
    handleKeyDown,
    handleFileSelect,
    handleRemoveFile
  };
} 