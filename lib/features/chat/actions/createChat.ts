import { Chat } from '@/lib/types/chat/chat';
import { ChatService } from '@/lib/services/chat/ChatService';

interface CreateChatParams {
  chatId: string;
  model: string;
  dominationField: string;
  name?: string;
  customPrompt?: string;
  metadata?: Record<string, any>;
}

export async function createChat(params: CreateChatParams): Promise<Chat> {
  try {
    console.log('Creating chat with params:', params);
    return await ChatService.createChat(params);
  } catch (error) {
    console.error('Error in createChat action:', error);
    throw error;
  }
} 