import { Chat, ChatMessage } from '@/lib/types/chat/chat';

export const addMessageToChat = (chat: Chat, message: ChatMessage): Chat => {
  const existingMessage = chat.messages.find(m => m.messagePairId === message.messagePairId);
  if (existingMessage) {
    return updateMessageInChat(chat, existingMessage.id, message);
  }
  
  return {
    ...chat,
    messages: [...chat.messages, message],
    updatedAt: new Date().toISOString()
  };
};

export const removeMessageFromChat = (chat: Chat, messageId: string): Chat => {
  return {
    ...chat,
    messages: chat.messages.filter(m => m.id !== messageId),
    updatedAt: new Date().toISOString()
  };
};

export const updateMessageInChat = (
  chat: Chat, 
  messageId: string, 
  updates: Partial<ChatMessage>
): Chat => {
  return {
    ...chat,
    messages: chat.messages.map(m => 
      m.id === messageId || m.messagePairId === updates.messagePairId 
        ? { ...m, ...updates } 
        : m
    ),
    updatedAt: new Date().toISOString()
  };
};

export const findMessageByPairId = (chat: Chat, messagePairId: string): ChatMessage | undefined => {
  return chat.messages.find(m => m.messagePairId === messagePairId);
}; 