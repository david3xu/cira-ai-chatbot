import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/lib/types/chat/chat';
import { ChatService } from '@/lib/services/chat/ChatService';

export interface SendMessageParams {
  message: string;
  chatId: string;
  dominationField: string;
  model: string;
  files?: File[];
  messagePairId?: string;
}

export async function sendMessage(params: SendMessageParams) {
  try {
    console.log('Sending message with params:', {
      ...params,
      messageLength: params.message.length,
      hasFiles: !!params.files?.length
    });

    return await ChatService.sendMessage({
      ...params,
      messagePairId: params.messagePairId || uuidv4()
    });
  } catch (error) {
    console.error('Error in sendMessage action:', error);
    throw error;
  }
} 