import { ChatMessage } from '@/lib/types/chat/chat';
import { fromApiCase } from '@/types/api/transformers';

export const formatMessageContent = (content: string): string => {
  return content.trim();
};

export const groupMessagesByDate = (messages: ChatMessage[]) => {
  return messages.reduce<Record<string, ChatMessage[]>>((groups, message) => {
    const camelCaseMessage = fromApiCase(message) as ChatMessage;
    const date = new Date(camelCaseMessage.createdAt).toLocaleDateString();
    return {
      ...groups,
      [date]: [...(groups[date] || []), camelCaseMessage]
    };
  }, {});
};

export const getMessageTimestamp = (message: ChatMessage): string => {
  return new Date(message.createdAt).toLocaleTimeString();
}; 