/**
 * AttachmentButton Component
 * 
 * Handles file attachments with:
 * - File selection
 * - Upload preview
 * - File type validation
 * - Base64 encoding
 * - Retry mechanism
 */

"use client"

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, File, Image, Loader2, X, Send } from 'lucide-react';
import { useChatContext } from '@/lib/features/chat/context/chatContext';
import { toast } from 'sonner';
import type { ChatAttachment } from '@/lib/services/ChatAttachmentService';

interface AttachmentButtonProps {
  messageId?: string;
  onAttach?: (attachment: ChatAttachment) => void;
}

interface FilePreview {
  file: File;
  previewUrl?: string;
  base64?: string;
  type: 'image' | 'document';
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function AttachmentButton({ messageId, onAttach }: AttachmentButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const { state } = useChatContext();
  const currentChat = state.currentChat;

  const encodeFileToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  const createPreview = useCallback(async (file: File) => {
    const preview: FilePreview = {
      file,
      type: file.type.startsWith('image/') ? 'image' : 'document'
    };
    
    if (preview.type === 'image') {
      preview.previewUrl = URL.createObjectURL(file);
      preview.base64 = await encodeFileToBase64(file);
    }
    
    setPreview(preview);
  }, [encodeFileToBase64]);

  const handleUpload = useCallback(async (file: File, retryCount = 0) => {
    if (!currentChat?.id) {
      toast.error('Please start a chat first');
      return;
    }

    if (!messageId) {
      toast.error('Message context is required');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', currentChat.id);
      formData.append('messageId', messageId);

      if (preview?.base64) {
        formData.append('base64Content', preview.base64);
      }

      const response = await fetch('/api/chat/attachments', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Add base64 content to the attachment if it's an image
      if (preview?.base64 && result.data) {
        result.data.base64Content = preview.base64;
      }

      onAttach?.(result.data);
      toast.success(`${file.type.startsWith('image/') ? 'Image' : 'Document'} uploaded successfully`);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error instanceof Error ? error : new Error('Upload failed'));
      
      if (retryCount < MAX_RETRIES) {
        toast.error(`Upload failed, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          handleUpload(file, retryCount + 1);
        }, RETRY_DELAY);
        return;
      }
      
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      if (retryCount === MAX_RETRIES || !uploadError) {
        setIsUploading(false);
        clearPreview();
      }
    }
  }, [currentChat?.id, messageId, onAttach, preview, uploadError]);

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
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        createPreview(file);
      }
    };

    // Trigger file selection
    input.click();
  }, [createPreview]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      createPreview(file);
    }
  }, [createPreview]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const clearPreview = useCallback(() => {
    if (preview?.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    setPreview(null);
  }, [preview]);

  const confirmUpload = useCallback(() => {
    if (preview?.file) {
      handleUpload(preview.file);
    }
  }, [preview, handleUpload]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative flex flex-col"
    >
      {preview ? (
        <div className="flex items-center gap-2 p-2 mb-2 bg-gray-800/50 rounded-lg">
          {preview.type === 'image' && preview.previewUrl ? (
            <div className="relative group">
              <img 
                src={preview.previewUrl} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                <button
                  onClick={confirmUpload}
                  className="p-1 bg-blue-500 rounded-full hover:bg-blue-400 mr-2"
                  disabled={isUploading}
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={clearPreview}
                  className="p-1 bg-gray-700 rounded-full hover:bg-gray-600"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pr-8 relative">
              <File className="w-4 h-4" />
              <span className="text-sm truncate max-w-[150px]">
                {preview.file.name}
              </span>
              <div className="absolute right-0 flex items-center gap-1">
                <button
                  onClick={confirmUpload}
                  className="p-1 bg-blue-500 rounded-full hover:bg-blue-400"
                  disabled={isUploading}
                >
                  <Send className="w-3 h-3" />
                </button>
                <button
                  onClick={clearPreview}
                  className="p-1 bg-gray-700 rounded-full hover:bg-gray-600"
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>
      ) : null}
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isUploading || !currentChat}
        className="relative"
        title="Attach file (images or documents)"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
