import { Chat } from '@/lib/types/chat/chat';

let currentChat: Chat | null = null;
const chatMap = new Map<string, Chat>();

export const sessionActions = {
  setCurrentChat: (chat: Chat | null) => {
    currentChat = chat;
  },
  getChat: (chatId: string) => {
    return chatMap.get(chatId) || null;
  },
  setChat: (chatId: string, chat: Chat) => {
    chatMap.set(chatId, chat);
  },
  updateChat: (chatId: string, updater: (chat: Chat) => Chat) => {
    const existingChat = chatMap.get(chatId);
    if (existingChat) {
      chatMap.set(chatId, updater(existingChat));
    }
  }
};
