import { supabase } from '@/lib/supabase/client';
import type { Database, Json } from '@/supabase/types/database.types';

export type AttachmentType = 'image' | 'document';

export interface AttachmentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  width?: number;  // For images
  height?: number; // For images
  duration?: number; // For future video/audio support
}

export interface ChatAttachment {
  id: string;
  chatId: string;
  messageId: string;
  filePath: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  metadata: AttachmentMetadata;
  url: string;
  createdAt: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class ChatAttachmentService {
  private static async validateFile(file: File): Promise<AttachmentType> {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'image';
    } else if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return 'document';
    }
    
    throw new Error('Unsupported file type. Allowed types: Images (JPEG, PNG, GIF, WEBP) and Documents (PDF, TXT, MD)');
  }

  private static async getImageMetadata(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static async uploadToStorage(
    file: File, 
    chatId: string, 
    type: AttachmentType
  ): Promise<{ path: string; url: string }> {
    const timestamp = new Date().getTime();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `chat-attachments/${chatId}/${type}/${timestamp}_${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(path, file);

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const { data: { publicUrl: url } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(path);

    return { path, url };
  }

  static async uploadAttachment(
    file: File,
    chatId: string,
    messageId: string
  ): Promise<ChatAttachment> {
    try {
      // Validate file
      const attachmentType = await this.validateFile(file);

      // Get metadata
      let metadata: AttachmentMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };

      // Get additional metadata for images
      if (attachmentType === 'image') {
        const imageMeta = await this.getImageMetadata(file);
        metadata = { ...metadata, ...imageMeta };
      }

      // Upload file to storage
      const { path, url } = await this.uploadToStorage(file, chatId, attachmentType);

      // Create database record
      const { data: attachment, error: dbError } = await supabase
        .from('chat_attachments')
        .insert({
          chat_id: chatId,
          message_id: messageId,
          file_path: path,
          file_type: file.type,
          file_name: file.name,
          file_size: file.size,
          metadata: metadata as unknown as Json
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Failed to save attachment: ${dbError.message}`);
      }

      if (!attachment) {
        throw new Error('Failed to create attachment record');
      }

      return {
        id: attachment.id,
        chatId: attachment.chat_id,
        messageId: attachment.message_id,
        filePath: attachment.file_path,
        fileType: attachment.file_type,
        fileName: attachment.file_name,
        fileSize: attachment.file_size,
        metadata: attachment.metadata as unknown as AttachmentMetadata,
        url,
        createdAt: attachment.created_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  static async getAttachments(messageId: string): Promise<ChatAttachment[]> {
    const { data: attachments, error } = await supabase
      .from('chat_attachments')
      .select('*')
      .eq('message_id', messageId);

    if (error) {
      throw new Error(`Failed to fetch attachments: ${error.message}`);
    }

    return attachments.map(attachment => ({
      id: attachment.id,
      chatId: attachment.chat_id,
      messageId: attachment.message_id,
      filePath: attachment.file_path,
      fileType: attachment.file_type,
      fileName: attachment.file_name,
      fileSize: attachment.file_size,
      metadata: attachment.metadata as unknown as AttachmentMetadata,
      url: supabase.storage
        .from('chat-attachments')
        .getPublicUrl(attachment.file_path)
        .data.publicUrl,
      createdAt: attachment.created_at || new Date().toISOString()
    }));
  }

  static async deleteAttachment(attachmentId: string): Promise<void> {
    const { data: attachment, error: fetchError } = await supabase
      .from('chat_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch attachment: ${fetchError.message}`);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('chat-attachments')
      .remove([attachment.file_path]);

    if (storageError) {
      throw new Error(`Failed to delete file: ${storageError.message}`);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('chat_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      throw new Error(`Failed to delete attachment record: ${dbError.message}`);
    }
  }
} 