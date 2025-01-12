/**
 * ChatAttachmentService
 * 
 * Handles all chat attachment operations:
 * - File uploads
 * - Attachment management
 * - Storage operations
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/supabase/types/database.types';
import { ChatError, ErrorCodes } from '@/lib/types/errors';

// Progress event interface
interface ProgressEvent {
  loaded: number;
  total: number;
}

export interface ChatAttachment {
  id: string;
  chatId: string;
  messageId: string;
  filePath: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  metadata: {
    mimeType: string;
    dimensions?: { width: number; height: number }; // for images
    pageCount?: number; // for documents
    textContent?: string; // for documents
  };
  createdAt: string;
  updatedAt: string;
}

const ALLOWED_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  // Documents
  'application/pdf', 'text/plain', 'text/markdown'
];

const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024,    // 5MB
  document: 10 * 1024 * 1024 // 10MB
};

export class ChatAttachmentService {
  private static supabase = createClientComponentClient<Database>();

  static async uploadAttachment(
    file: File,
    chatId: string,
    messageId: string,
    onProgress?: (progress: number) => void
  ): Promise<ChatAttachment> {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ChatError(
        'Unsupported file type',
        ErrorCodes.VALIDATION_ERROR,
        { fileType: file.type }
      );
    }

    // Validate file size
    const maxSize = file.type.startsWith('image/') 
      ? MAX_FILE_SIZES.image 
      : MAX_FILE_SIZES.document;

    if (file.size > maxSize) {
      throw new ChatError(
        'File size exceeds limit',
        ErrorCodes.VALIDATION_ERROR,
        { fileSize: file.size, maxSize }
      );
    }

    // Generate storage path
    const fileType = file.type.startsWith('image/') ? 'images' : 'documents';
    const filePath = `${chatId}/${fileType}/${file.name}`;

    try {
      // Start progress
      onProgress?.(0);

      // Upload to storage
      const { error: uploadError, data } = await this.supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Upload complete
      onProgress?.(100);

      // Extract metadata
      const metadata: ChatAttachment['metadata'] = {
        mimeType: file.type
      };

      // For images, get dimensions
      if (file.type.startsWith('image/')) {
        const dimensions = await this.getImageDimensions(file);
        metadata.dimensions = dimensions;
      }

      // For text documents, extract content
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        const textContent = await file.text();
        metadata.textContent = textContent.slice(0, 1000); // Store first 1000 chars
      }

      // Create database record
      const { data: attachment, error: dbError } = await this.supabase
        .from('chat_attachments')
        .insert({
          chat_id: chatId,
          message_id: messageId,
          file_path: filePath,
          file_type: file.type,
          file_name: file.name,
          file_size: file.size,
          metadata
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return this.transformAttachment(attachment);

    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw new ChatError(
        'Failed to upload attachment',
        ErrorCodes.VALIDATION_ERROR,
        { originalError: error }
      );
    }
  }

  static async getAttachments(messageId: string): Promise<ChatAttachment[]> {
    const { data, error } = await this.supabase
      .from('chat_attachments')
      .select('*')
      .eq('message_id', messageId);

    if (error) throw error;
    return data.map(this.transformAttachment);
  }

  static async deleteAttachment(attachmentId: string): Promise<void> {
    const { data: attachment, error: fetchError } = await this.supabase
      .from('chat_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from('chat-attachments')
      .remove([attachment.file_path]);

    if (storageError) throw storageError;

    // Delete database record
    const { error: dbError } = await this.supabase
      .from('chat_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) throw dbError;
  }

  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private static transformAttachment(data: any): ChatAttachment {
    return {
      id: data.id,
      chatId: data.chat_id,
      messageId: data.message_id,
      filePath: data.file_path,
      fileType: data.file_type,
      fileName: data.file_name,
      fileSize: data.file_size,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
} 