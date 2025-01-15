/**
 * AttachmentButton Component
 * 
 * Handles file attachments with:
 * - File selection
 * - Upload preview
 * - File type validation
 * - Separate handling for images and documents
 */

"use client"

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, File, Image, Loader2, X, Send } from 'lucide-react';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { toast } from 'sonner';
import type { ChatAttachment } from '@/lib/services/ChatAttachmentService';

interface AttachmentButtonProps {
  messageId: string;
  chatId: string;
  onAttach?: (attachment: ChatAttachment) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

interface FilePreview {
  file: File;
  previewUrl?: string;
  base64?: string;
  type: 'image' | 'document';
  dimensions?: {
    width: number;
    height: number;
  };
}

interface ImageMetadata {
  type: 'image';
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  base64Data: string; // Store raw base64 data
  openai_format?: {  // Make it optional, will be generated when needed
    type: 'image_url';
    image_url: {
      url: string;
    };
  };
}

interface DocumentMetadata {
  type: 'document';
  mimeType: string;
  textContent?: string;
  pageCount?: number;
}

type AttachmentMetadata = ImageMetadata | DocumentMetadata;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const AttachmentButton: React.FC<AttachmentButtonProps> = ({
  messageId,
  chatId,
  onAttach,
  onUploadStart,
  onUploadEnd,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const { state } = useChatContext();
  const _ = state.currentChat;

  const encodeFileToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    if (!chatId || !messageId) {
      console.warn('⚠️ No chat or message context for file upload');
      toast.error('Please start a chat first');
      return;
    }

    try {
      onUploadStart?.();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);
      formData.append('messageId', messageId);
      
      // Create type-specific metadata
      let metadata: AttachmentMetadata;
      
      if (file.type.startsWith('image/')) {
        // Handle image files - ensure we have base64 data
        const base64Data = await encodeFileToBase64(file).then(data => data.split(',')[1]);
        
        if (!base64Data) {
          throw new Error('Failed to encode image to base64');
        }
        
        // Get image dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            resolve({
              width: img.width,
              height: img.height
            });
          };
          img.src = URL.createObjectURL(file);
        });
        
        metadata = {
          type: 'image',
          mimeType: file.type,
          dimensions,
          base64Data,
        };
      } else {
        // Handle document files
        metadata = {
          type: 'document',
          mimeType: file.type,
          textContent: file.type === 'text/plain' || file.type === 'text/markdown' 
            ? await file.text().then(text => text.slice(0, 1000))
            : undefined
        };
      }

      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch('/api/chat/attachments', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      if (result.data) {
        onAttach?.(result.data);
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to upload file:', error);
      setUploadError(new Error('Failed to upload file'));
      toast.error('Failed to upload file');
    } finally {
      onUploadEnd?.();
    }
  }, [chatId, messageId, onAttach, onUploadStart, onUploadEnd, encodeFileToBase64]);

  const handleFileChange = useCallback(async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    if (!chatId || !messageId) {
      console.warn('⚠️ No chat or message context for file upload');
      toast.error('Please start a chat first');
      return;
    }

    console.log('📎 Processing files:', { count: files.length });

    // Convert FileList to Array
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      try {
        await handleUpload(file);
      } catch (error) {
        console.error('❌ Failed to process file:', error);
        toast.error('Failed to process file');
      }
    }

    // Safely clear the input
    try {
      input.value = '';
    } catch (error) {
      console.warn('Failed to clear file input:', error);
    }
  }, [chatId, messageId, handleUpload]);

  const handleClick = useCallback(() => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Documents
      'application/pdf',
      'text/plain',
      'text/markdown',
      '.md'
    ].join(',');

    // Handle file selection
    input.onchange = handleFileChange;

    // Trigger file selection
    input.click();
  }, [handleFileChange]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isUploading}
        className="hover:bg-gray-700/50"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Paperclip className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
