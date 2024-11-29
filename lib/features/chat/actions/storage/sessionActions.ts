import { Chat } from '@/lib/types/chat/chat';

export const sessionActions = {
  setCurrentChat: (chat: Chat | null) => {
    if (chat) {
      sessionStorage.setItem('currentChat', JSON.stringify(chat));
    } else {
      sessionStorage.removeItem('currentChat');
    }
  }
};
