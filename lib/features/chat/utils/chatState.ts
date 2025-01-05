import { Chat, ChatMessage } from '@/lib/types';

/**
 * Chat State Utilities
 * 
 * Functions:
 * - addMessageToChat: Adds or updates a message in a chat's message list
 * - removeMessageFromChat: Removes a message from a chat by ID
 * - updateMessageInChat: Updates specific message properties in a chat
 * - findMessageByPairId: Locates a message using its pair ID and streaming status
 * - updateStreamingMessage: Updates content of a streaming message
 * 
 * Features:
 * - Immutable state updates
 * - Message pair handling
 * - Streaming message support
 * - Timestamp management
 */

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
    messages: chat.messages.map(m => {
      if (m.id === messageId || 
         (m.messagePairId === updates.messagePairId && m.isStreaming)) {
        return { 
          ...m, 
          ...updates,
          isStreaming: updates.isStreaming ?? m.isStreaming,
          temporary: updates.temporary ?? m.temporary
        };
      }
      return m;
    }),
    updatedAt: new Date().toISOString()
  };
};

export const findMessageByPairId = (
  chat: Chat, 
  messagePairId: string, 
  options?: { 
    isStreaming?: boolean 
  }
): ChatMessage | undefined => {
  return chat.messages.find(m => 
    m.messagePairId === messagePairId && 
    (options?.isStreaming === undefined || m.isStreaming === options.isStreaming)
  );
};

export const updateStreamingMessage = (
  chat: Chat,
  messagePairId: string,
  content: string
): Chat => {
  return {
    ...chat,
    messages: chat.messages.map(m => 
      m.messagePairId === messagePairId && m.isStreaming
        ? {
            ...m,
            assistantContent: content,
            updatedAt: new Date().toISOString()
          }
        : m
    )
  };
}; 