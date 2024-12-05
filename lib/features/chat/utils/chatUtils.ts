import { Chat, ChatMessage } from '@/lib/types/chat/chat';

export const isValidChat = (chat: Chat): boolean => {
  return (
    typeof chat.id === 'string' &&
    Array.isArray(chat.messages) &&
    typeof chat.createdAt === 'string' &&
    typeof chat.updatedAt === 'string' &&
    typeof chat.model === 'string' &&
    typeof chat.dominationField === 'string'
  );
};
  
export const getChatName = (chat: Chat): string => {
  if (chat.name) return chat.name;
  if (chat.chatTopic) return chat.chatTopic;
  
  const firstUserMessage = chat.messages.find(m => m.userRole === 'user');
  if (firstUserMessage && firstUserMessage.userContent) {
    const topic = firstUserMessage.userContent.slice(0, 30);
    return topic.length < firstUserMessage.userContent.length 
      ? `${topic}...` 
      : topic;
  }
  
  return `Chat ${chat.id.slice(0, 8)}`;
}; 