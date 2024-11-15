import { useState, useRef, useCallback, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useRouter } from 'next/navigation';
import { encodeImageToBase64, compressImage } from '@/lib/utils/file';
import { FileProcessingService } from '@/lib/services/fileProcessingService';
import { handleStreamResponse } from '@/lib/utils/streamHandler';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/lib/chat';
import { MessageContent, FormattedMessage } from '@/types/messages';
import { sendMessageToDatabase } from '@/actions/chat/sendMessage';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions.mjs';
import { verifyMessageStorage } from '@/lib/dbVerification';
import { fetchChatHistory } from '@/actions/chat/fetchHistory';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const validateImage = (file: File) => {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Unsupported image type. Please use JPG, PNG, GIF, or WebP.');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image file is too large (max 5MB).');
  }
};

// Add type for streaming message state
type StreamingMessageState = string;

export const useMessageInput = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    base64: string;
    url: string;
    type: string;
    name: string;
  } | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);

  const {
    updateCurrentChat,
    isLoading,
    setIsLoading,
    currentChat,
    dominationField,
    customPrompt,
    createNewChat,
    setStreamingMessage,
    setDominationField,
    model,
    setCurrentChat,
    isInitializing,
    initializeChat,
  } = useChat();

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const createUserMessage = (textContent: string, fieldToUse: string): ChatMessage => {
    const messageContent = selectedFile ? {
      text: textContent,
      document: {
        text: fileContent || '',
        metadata: {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          previewUrl: documentPreviewUrl || undefined
        }
      }
    } : textContent;

    return {
      id: uuidv4(),
      role: 'user',
      content: messageContent,
      dominationField: fieldToUse,
      image: selectedImage?.base64,
      model: model
    };
  };

  const handleSendMessage = async (message: string, imageFile?: string | null) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      let chatToUse = currentChat;
      
      // Initialize chat if none exists
      if (!currentChat?.id) {
        const chatId = uuidv4();
        console.log('Initializing new chat with ID:', chatId);
        
        const newChat = await createNewChat({
          chatId,
          model: model,
          customPrompt: customPrompt,
          dominationField: dominationField
        });
        
        if (!newChat) {
          throw new Error('Failed to create new chat');
        }
        
        chatToUse = newChat;
        setCurrentChat(newChat);
        
        // Wait for router update and state to settle
        await router.push(`/chat/${chatId}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Verify chat exists and has valid ID
      if (!chatToUse?.id) {
        console.error('Invalid chat state:', chatToUse);
        throw new Error('Invalid chat state');
      }

      // Create and send message
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          chatId: chatToUse.id,
          imageFile: imageFile,
          model: model,
          dominationField: dominationField
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream available');

      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) throw new Error(data.error);
              if (data.token) {
                fullResponse += data.token;
                setStreamingMessage(prev => prev + data.token);
              }
            } catch (error) {
              console.error('Error parsing streaming data:', error);
            }
          }
        }
      }

      // Add assistant message to UI
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: fullResponse,
        dominationField: dominationField,
        model: model
      };

      updateCurrentChat(prev => ({
        ...prev!,
        messages: [...prev!.messages, assistantMessage]
      }));

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyWithRetry = async (chatId: string, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      const result = await verifyMessageStorage(chatId);
      if (result && result.messageCount > 0) {
        return result;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
    throw new Error('Failed to verify message storage after retries');
  };

  const processMessageContent = async (): Promise<FormattedMessage> => {
    if (selectedImage) {
      return {
        role: 'user',
        content: [
          {
            type: "text",
            text: message
          } as ChatCompletionContentPart,
          {
            type: "image_url",
            image_url: {
              url: selectedImage.base64,
              detail: "low"
            }
          } as ChatCompletionContentPart
        ]
      };
    }
    
    return {
      role: 'user',
      content: message // For text-only messages, use string directly
    };
  };

  const clearInputState = () => {
    setMessage("");
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setSelectedFile(null);
    setStreamingMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type.startsWith('image/')) {
        // Validate image before processing
        validateImage(file);

        // Convert to base64 with proper formatting
        const base64Image = await encodeImageToBase64(file);
        if (!base64Image.startsWith('data:image/')) {
          throw new Error('Invalid image format');
        }

        // Compress image if needed
        const compressedImage = await compressImage(base64Image);
        
        // Store both the base64 and URL versions
        setSelectedImage({
          base64: compressedImage,
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name
        });
        setImagePreviewUrl(URL.createObjectURL(file));
        setSelectedFile(null);
        setDocumentPreviewUrl(null);
      } else {
        const result = await FileProcessingService.processFile({
          file,
          source: 'chat-upload',
          author: 'user',
          dominationField,
          abortSignal: abortControllerRef.current.signal,
          onProgress: (progress) => {
            console.log('Upload progress:', progress);
          }
        });

        if (result.success) {
          setSelectedFile(file);
          setFileContent(result.document?.text || '');
          setDocumentPreviewUrl(URL.createObjectURL(file));
          setSelectedImage(null);
          setImagePreviewUrl(null);
        } else {
          setError(result.error || 'Failed to process file');
        }
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to process the file');
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const base64Image = await encodeImageToBase64(file);
          const compressedImage = await compressImage(base64Image);
          setSelectedImage({
            base64: compressedImage,
            url: URL.createObjectURL(file),
            type: file.type,
            name: file.name
          });
          setImagePreviewUrl(URL.createObjectURL(file));
        }
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
    };
  }, [imagePreviewUrl, documentPreviewUrl]);

  return {
    message,
    error,
    selectedImage,
    imagePreviewUrl,
    selectedFile,
    documentPreviewUrl,
    isLoading,
    fileInputRef,
    handleSendMessage,
    handleInputChange,
    handleImageUpload,
    handleFileChange,
    handleStreamResponse,
    handlePaste
  };
}; 
