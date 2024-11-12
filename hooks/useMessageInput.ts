import { useState, useRef, useCallback, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useRouter } from 'next/navigation';
import { encodeImageToBase64, compressImage } from '@/lib/utils/file';
import { FileProcessingService } from '@/lib/services/fileProcessingService';
import { ChatModeHandler } from '@/lib/services/chatModeHandler';
import { handleSendMessage } from '@/actions/chat';
import { storeMessagePair } from '@/actions/chat/storeMessage';
import { handleStreamResponse } from '@/lib/utils/streamHandler';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/lib/chat';
import { MessageContent, FormattedMessage } from '@/types/messages';

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

  const handleSend = async () => {
    const textContent = message?.trim();
    if ((!textContent && !selectedImage && !selectedFile) || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      setStreamingMessage('');

      // Validate chat requirements
      if (!currentChat && !createNewChat) {
        throw new Error('Unable to create new chat');
      }

      const fieldToUse = dominationField || 'Normal Chat';
      if (!dominationField) setDominationField('Normal Chat');

      let chatToUse = currentChat;
      if (!chatToUse) {
        chatToUse = createNewChat();
        router.push(`/chat/${chatToUse.id}`);
      }

      // Immediately add user message to chat
      const userMessage = createUserMessage(message, fieldToUse);
      updateCurrentChat(prev => ({
        ...prev!,
        messages: [...prev!.messages, userMessage]
      }));

      // Clear input state immediately after user message appears
      clearInputState();

      // Process and send message
      const processedContent = await processMessageContent();
      const messageToSend = typeof processedContent.content === 'string' 
        ? processedContent.content 
        : JSON.stringify(processedContent.content);

      const response = await handleSendMessage(
        messageToSend,
        selectedImage ? new File([selectedImage.base64], selectedImage.name, { type: selectedImage.type }) : undefined,
        fieldToUse,
        customPrompt,
        chatToUse.id,
        currentChat?.messages || [],
        !!currentChat?.historyLoaded,
        model,
        // Update streaming message in real-time
        (token: string) => setStreamingMessage(prev => prev + token)
      );

      // After completion, add assistant message to chat
      if (response) {
        updateCurrentChat(prev => ({
          ...prev!,
          messages: [...prev!.messages, response.assistantMessage]
        }));
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  const processMessageContent = async (): Promise<FormattedMessage> => {
    if (selectedImage) {
      return {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: message 
          },
          {
            type: 'image_url',
            image_url: {
              url: selectedImage.base64,
              detail: 'low'
            }
          }
        ]
      };
    }
    
    return {
      role: 'user',
      content: {
        type: 'text',
        text: message
      }
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
    setMessage,
    error,
    selectedImage,
    imagePreviewUrl,
    selectedFile,
    documentPreviewUrl,
    fileContent,
    isLoading,
    fileInputRef,
    handleSend,
    handleInputChange,
    handleImageUpload,
    handleFileChange,
    handleStreamResponse,
    handlePaste
  };
}; 