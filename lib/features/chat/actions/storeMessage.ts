import { ChatMessage } from '@/lib/types/chat/chat';
import { ChatService } from '@/lib/services/chat/ChatService';

export async function saveMessage(message: ChatMessage) {
  try {
    console.log('Storing message:', {
      chatId: message.chatId,
      messagePairId: message.messagePairId,
      contentLength: message.userContent.length
    });

    return await ChatService.saveMessage(message);
  } catch (error) {
    console.error('Error in saveMessage action:', error);
    throw error;
  }
} 