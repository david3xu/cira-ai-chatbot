import type { Chat, ChatMessage } from '@/lib/types';

export const persistentActions = {
  // Only keep local storage specific operations
  saveToLocalStorage: (chat: Chat) => {
    const existingChats = JSON.parse(localStorage.getItem('chats') || '[]');
    const updatedChats = existingChats.map((c: Chat) => 
      c.id === chat.id ? chat : c
    );
    
    if (!existingChats.find((c: Chat) => c.id === chat.id)) {
      updatedChats.push(chat);
    }
    
    localStorage.setItem('chats', JSON.stringify(updatedChats));
    localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
  },

  removeFromLocalStorage: (chatId: string) => {
    localStorage.removeItem(`chat_${chatId}`);
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const updatedChats = chats.filter((c: Chat) => c.id !== chatId);
    localStorage.setItem('chats', JSON.stringify(updatedChats));
  },

  getFromLocalStorage: (chatId: string): Chat | null => {
    const chatData = localStorage.getItem(`chat_${chatId}`);
    return chatData ? JSON.parse(chatData) : null;
  },

  getAllFromLocalStorage: (): Chat[] => {
    const chats = localStorage.getItem('chats');
    return chats ? JSON.parse(chats) : [];
  }
}; 