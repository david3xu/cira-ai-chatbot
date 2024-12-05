import { ChatMessage } from '@/lib/types/chat/chat';
import { storageActions } from '@/lib/features/chat/actions/storage';

export async function saveMessage(message: ChatMessage) {
  try {
    // Validate message types
    if (message.userRole !== 'user' && message.userRole !== 'system') {
      throw new Error('Invalid userRole type');
    }

    if (message.assistantRole !== 'assistant') {
      throw new Error('Invalid assistantRole type');
    }

    console.log('Storing message:', {
      chatId: message.chatId,
      messagePairId: message.messagePairId,
      type: message.userContent ? 'user' : 'assistant',
      userRole: message.userRole
    });

    // Save to database only
    await storageActions.database.saveMessage(message);

    return message;
  } catch (error) {
    console.error('Error in saveMessage action:', error);
    throw error;
  }
}

export async function saveMessagePair(
  userMessage: ChatMessage,
  assistantMessage: ChatMessage
) {
  try {
    // Validate message pair
    if (!userMessage.userContent || !assistantMessage.assistantContent) {
      throw new Error('Invalid message pair: missing content');
    }

    // Create a single record with both contents
    const combinedMessage = {
      ...userMessage,
      assistantContent: assistantMessage.assistantContent,
      status: 'success' as const,
      updatedAt: new Date().toISOString()
    };

    // Save the combined message
    await storageActions.database.saveMessage(combinedMessage);

    console.log('Message pair saved:', {
      messagePairId: userMessage.messagePairId,
      userMessageId: userMessage.id,
      hasUserContent: !!combinedMessage.userContent,
      hasAssistantContent: !!combinedMessage.assistantContent
    });

  } catch (error) {
    console.error('Error saving message pair:', error);
    throw error;
  }
} 