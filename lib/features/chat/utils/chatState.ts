import { Chat, ChatMessage } from '@/lib/types/chat/chat';

export const addMessageToChat = (chat: Chat, message: ChatMessage): Chat => {
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
      m.id === messageId ? { ...m, ...updates } : m
    ),
    updatedAt: new Date().toISOString()
  };
}; 