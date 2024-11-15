import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage } from './utils/imageUpload';
import { truncateMessageContent } from './utils/messageContent';
import { MessageContentManager } from '@/lib/messageContent';

interface ProcessedMessage {
  content: string;
  type: 'text' | 'image' | 'document';
  metadata: {
    length: number;
    timestamp: string;
    imageUrl?: string;
  };
}

interface MessageProcessor {
  processMessage: (input: string | { text: string }) => Promise<ProcessedMessage>;
  validateContent: (content: string) => boolean;
  sanitizeInput: (input: string) => string;
}

class TextMessageProcessor implements MessageProcessor {
  async processMessage(input: string | { text: string }): Promise<ProcessedMessage> {
    const textContent = typeof input === 'string' ? input : input.text || '';
    const sanitized = this.sanitizeInput(textContent);
    
    const truncated = sanitized.length > 8000 ? sanitized.slice(0, 8000) + '...(truncated)' : sanitized;

    return {
      content: truncated,
      type: 'text',
      metadata: {
        length: sanitized.length,
        timestamp: new Date().toISOString()
      }
    };
  }

  validateContent(content: string): boolean {
    return content.length <= 8000;
  }

  sanitizeInput(input: string): string {
    return input.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  }
}

class ImageMessageProcessor extends TextMessageProcessor {
  async processMessage(input: string, imageData?: string): Promise<ProcessedMessage> {
    const sanitized = this.sanitizeInput(input);
    
    if (!this.validateContent(sanitized)) {
      throw new Error('Invalid message content');
    }

    return {
      content: sanitized,
      type: 'image',
      metadata: {
        length: sanitized.length,
        timestamp: new Date().toISOString(),
        imageUrl: imageData
      }
    };
  }
}

export async function storeChatMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  dominationField: string,
  imageFile?: File | string,
  chat_topic?: string,
  model?: string
) {
  try {
    const messageData = {
      chat_id: chatId,
      message_pair_id: uuidv4(),
      domination_field: dominationField,
      model: model,
      chat_topic: chat_topic,
      image_url: imageFile && typeof imageFile === 'string' ? imageFile : undefined,
      created_at: new Date().toISOString()
    };

    const messageRecord = role === 'user' 
      ? {
          ...messageData,
          user_content: content,
          user_role: 'user',
          assistant_content: null,
          assistant_role: null
        }
      : {
          ...messageData,
          assistant_content: content,
          assistant_role: 'assistant',
          user_content: null,
          user_role: null
        };

    const { data, error } = await supabase
      .from('chat_history')
      .insert(messageRecord)
      .select()
      .single();

    if (error) {
      console.error('Error storing message:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in storeChatMessage:', error);
    throw error;
  }
}

// Helper function to process image files
async function processImageFile(imageFile?: File | string): Promise<string | undefined> {
  if (!imageFile) return undefined;

  try {
    if (typeof imageFile === 'string' && imageFile.startsWith('http')) {
      return imageFile;
    }
    
    if (imageFile instanceof File && imageFile.size <= 5 * 1024 * 1024) {
      return await uploadImage(imageFile);
    }
    
    console.warn('Image file too large or invalid format, skipping storage');
    return undefined;
  } catch (error) {
    console.error('Error processing image:', error);
    return undefined;
  }
}

export async function storeChatMessageWithRetry(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  dominationField: string,
  maxRetries = 3
) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      await storeChatMessage(chatId, role, content, dominationField);
      return;
    } catch (error) {
      attempts++;
      if (attempts === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
}

export async function storeMessagePair(
  chatId: string,
  userMessage: string,
  assistantMessage: string,
  dominationField: string,
  imageUrl?: string,
  retries = 3
) {
  const messagePairId = uuidv4();
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert([
          {
            chat_id: chatId,
            message_pair_id: messagePairId,
            user_content: userMessage,
            assistant_content: assistantMessage,
            domination_field: dominationField,
            image_url: imageUrl,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (attempt === retries - 1) {
        console.error('Failed to store message pair after retries:', error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}
