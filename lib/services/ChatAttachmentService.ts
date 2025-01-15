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
import { getSupabaseClient } from '@/lib/supabase/client';

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
    imageDetail?: 'low' | 'high' | 'auto';
    base64Data?: string; // for images
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

const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000';

export class ChatAttachmentService {
  private static supabase = getSupabaseClient();

  private static async ensureMessageExists(
    chatId: string,
    messageId: string,
    userId: string = DEFAULT_USER_ID
  ): Promise<void> {
    // Check if message exists
    const { data: message, error: messageError } = await this.supabase
      .from('chat_history')
      .select('id')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      console.log('Message not found, creating system message:', { chatId, messageId });
      
      // Get chat details for domination_field
      const { data: chat, error: chatError } = await this.supabase
        .from('chats')
        .select('domination_field, model')
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;

      // Create system message
      const { error: createError } = await this.supabase
        .from('chat_history')
        .insert({
          id: messageId,
          chat_id: chatId,
          user_id: userId,
          message_pair_id: crypto.randomUUID(),
          user_role: 'system',
          assistant_role: 'system',
          user_content: 'File attachment',
          status: 'success',
          model: chat.model,
          domination_field: chat.domination_field
        });

      if (createError) {
        console.error('Failed to create system message:', createError);
        throw createError;
      }
    }
  }

  /**
   * Upload an attachment for a chat message
   * @param file The file to upload
   * @param chatId The chat ID
   * @param messageId The message ID
   * @param userId The user ID
   * @param formData The form data containing metadata
   * @param onProgress Optional progress callback
   * @returns The created chat attachment
   */
  static async uploadAttachment(
    file: File,
    chatId: string,
    messageId: string,
    userId: string = DEFAULT_USER_ID,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ChatAttachment> {
    try {
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

      // Ensure message exists in chat_history
      await this.ensureMessageExists(chatId, messageId, DEFAULT_USER_ID);

      // Generate storage path with timestamp to avoid conflicts
      const timestamp = new Date().getTime();
      const fileType = file.type.startsWith('image/') ? 'images' : 'documents';
      const filePath = `${chatId}/${fileType}/${timestamp}_${file.name}`;

      // Start progress
      onProgress?.(0);

      // Upload to storage
      console.log('📤 Uploading file to storage:', {
        filePath,
        fileType: file.type,
        fileSize: file.size
      });

      const { error: uploadError, data } = await this.supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new ChatError(
          'Failed to upload file to storage',
          ErrorCodes.STORAGE_ERROR,
          { originalError: uploadError }
        );
      }

      console.log('✅ File uploaded to storage successfully:', {
        path: data?.path,
        size: file.size
      });

      // Upload complete
      onProgress?.(100);

      // Extract metadata from form data
      const uploadedMetadata = JSON.parse(formData.get('metadata') as string || '{}');
      
      // Create metadata object, preserving base64Data if it exists
      const metadata: ChatAttachment['metadata'] = {
        mimeType: file.type,
        ...uploadedMetadata, // Keep all uploaded metadata including base64Data
        // Add additional metadata if needed and not already present
        ...(file.type.startsWith('image/') && typeof window !== 'undefined' && !uploadedMetadata.dimensions ? {
          dimensions: await this.getImageDimensions(file).catch(() => undefined)
        } : {}),
        ...(file.type === 'text/plain' || file.type === 'text/markdown' ? {
          textContent: !uploadedMetadata.textContent ? await file.text().then(text => text.slice(0, 1000)).catch(() => undefined) : uploadedMetadata.textContent
        } : {})
      };

      // Log metadata state for debugging
      console.log('📝 Attachment metadata:', {
        hasBase64: !!metadata.base64Data,
        mimeType: metadata.mimeType,
        dimensions: metadata.dimensions
      });

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

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      if (!attachment) {
        throw new Error('No attachment data returned from database');
      }

      return this.transformAttachment(attachment);

    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw new ChatError(
        'Failed to upload attachment',
        ErrorCodes.API_ERROR,
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
      const img = new window.Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
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