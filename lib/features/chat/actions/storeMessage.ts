import { ChatMessage } from '@/lib/types/chat/chat';
import { ChatService } from '@/lib/services/chat/ChatService';

export async function storeMessage(message: ChatMessage) {
  try {
    console.log('Storing message:', {
      chatId: message.chatId,
      messagePairId: message.messagePairId,
      contentLength: message.userContent.length
    });

    return await ChatService.storeMessage(message);
  } catch (error) {
    console.error('Error in storeMessage action:', error);
    throw error;
  }
} 