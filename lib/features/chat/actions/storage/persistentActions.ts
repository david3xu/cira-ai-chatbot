import { Chat, ChatMessage, ChatUpdate } from '@/lib/types/chat/chat';

export const persistentActions = {
  saveChat: (chat: Chat) => {
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
  
  saveMessage: (message: ChatMessage, chatId: string) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const chatIndex = chats.findIndex((c: Chat) => c.id === chatId);
    
    if (chatIndex !== -1) {
      chats[chatIndex].messages = [...(chats[chatIndex].messages || []), message];
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  },
  
  saveChats: (chats: Chat[]) => {
    localStorage.setItem('chats', JSON.stringify(chats));
    chats.forEach(chat => {
      localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
    });
  },
  
  removeChat: (chatId: string) => {
    localStorage.removeItem(`chat_${chatId}`);
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const updatedChats = chats.filter((c: Chat) => c.id !== chatId);
    localStorage.setItem('chats', JSON.stringify(updatedChats));
  },
  
  getChat: (chatId: string): Chat | null => {
    const chatData = localStorage.getItem(`chat_${chatId}`);
    return chatData ? JSON.parse(chatData) : null;
  },
  
  getChats: (): Chat[] => {
    const chats = localStorage.getItem('chats');
    return chats ? JSON.parse(chats) : [];
  },
  
  updateChat: async (chatId: string, updates: ChatUpdate) => {
    const chat = persistentActions.getChat(chatId);
    if (chat) {
      const updatedChat = {
        ...chat,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      persistentActions.saveChat(updatedChat);
      return { data: updatedChat, error: null };
    }
    return { data: null, error: new Error('Chat not found') };
  },
};
