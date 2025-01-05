import { Chat, ChatMessage } from '@/lib/types';

/**
 * Chat Utility Functions
 * 
 * Functions:
 * - isValidChat: Validates chat object structure
 * - getChatName: Generates display name for chat
 * 
 * Features:
 * - Type validation
 * - Smart name generation
 * - Fallback handling
 * - Content truncation
 */

export const isValidChat = (chat: Chat): boolean => {
  return (
    typeof chat.id === 'string' &&
    Array.isArray(chat.messages) &&
    typeof chat.createdAt === 'string' &&
    typeof chat.updatedAt === 'string' &&
    typeof chat.model === 'string' &&
    typeof chat.domination_field === 'string'
  );
};
  
export const getChatName = (chat: Chat): string => {
  if (chat.name) return chat.name;
  if (chat.chatTopic) return chat.chatTopic;
  
  const firstUserMessage = chat.messages.find(m => m.user_role === 'user');
  if (firstUserMessage && firstUserMessage.user_content) {
    const topic = firstUserMessage.user_content.slice(0, 30);
    return topic.length < firstUserMessage.user_content.length 
      ? `${topic}...` 
      : topic;
  }
  
  return `Chat ${chat.id.slice(0, 8)}`;
}; 