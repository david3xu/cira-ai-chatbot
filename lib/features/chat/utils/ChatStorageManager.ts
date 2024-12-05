import { Chat, ChatMessage } from "@/lib/types/chat/chat";
import { StorageQueueManager } from "../context/MessageQueueManager";

export class ChatStorageManager {
  private static isLoading = false;

  static setLoading(loading: boolean) {
    this.isLoading = loading;
    console.log('🔄 [ChatStorageManager] Loading state:', loading);
  }

  static async executeTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return StorageQueueManager.enqueueStorage(async () => {
      try {
        this.setLoading(true);
        return await operation();
      } finally {
        this.setLoading(false);
      }
    });
  }

  static async executeWithTransaction<T>(
    chatId: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    console.log('🔄 [ChatStorageManager] Executing transaction for chat:', chatId);
    
    return this.executeTransaction(async () => {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        console.error('❌ [ChatStorageManager] Transaction failed:', error);
        throw error;
      }
    });
  }

  static async updateChat(chat: Chat): Promise<void> {
    return this.executeTransaction(async () => {
      const currentChatStr = localStorage.getItem(`chat:${chat.id}`);
      const currentChat = currentChatStr ? JSON.parse(currentChatStr) : null;
      
      const hasChanged = !currentChat || 
        currentChat.id !== chat.id ||
        currentChat.userId !== chat.userId ||
        currentChat.name !== chat.name ||
        currentChat.createdAt !== chat.createdAt ||
        currentChat.updatedAt !== chat.updatedAt ||
        currentChat.model !== chat.model ||
        currentChat.dominationField !== chat.dominationField ||
        currentChat.customPrompt !== chat.customPrompt ||
        currentChat.chatTopic !== chat.chatTopic ||
        currentChat.historyLoaded !== chat.historyLoaded ||
        JSON.stringify(currentChat.metadata) !== JSON.stringify(chat.metadata) ||
        JSON.stringify(currentChat.messages) !== JSON.stringify(chat.messages);
      
      if (hasChanged) {
        console.log('💾 [ChatStorageManager] Updating chat:', chat.id);
        const chatToStore: Chat = {
          id: chat.id,
          userId: chat.userId,
          name: chat.name,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          model: chat.model,
          dominationField: chat.dominationField,
          customPrompt: chat.customPrompt,
          metadata: chat.metadata,
          messages: chat.messages,
          chatTopic: chat.chatTopic,
          historyLoaded: chat.historyLoaded
        };

        await Promise.all([
          localStorage.setItem(`chat:${chat.id}`, JSON.stringify(chatToStore)),
          sessionStorage.setItem('currentChat', JSON.stringify(chatToStore))
        ]);
      }
    });
  }

  static async updateMessage(message: ChatMessage, chatId: string): Promise<void> {
    return this.executeTransaction(async () => {
      console.log('💾 [ChatStorageManager] Updating message:', { 
        messageId: message.messagePairId,
        chatId 
      });

      const chatStr = localStorage.getItem(`chat:${chatId}`);
      if (!chatStr) {
        throw new Error('Chat not found in storage');
      }

      const chat: Chat = JSON.parse(chatStr);
      
      const messageExists = chat.messages.some(m => m.messagePairId === message.messagePairId);
      if (messageExists) {
        return;
      }

      const updatedChat = {
        ...chat,
        messages: [...chat.messages, message]
      };

      await Promise.all([
        localStorage.setItem(`chat:${chatId}`, JSON.stringify(updatedChat)),
        sessionStorage.setItem('currentChat', JSON.stringify(updatedChat))
      ]);
    });
  }

  static async deleteChat(chatId: string): Promise<void> {
    return this.executeTransaction(async () => {
      console.log('🗑️ [ChatStorageManager] Deleting chat:', chatId);
      localStorage.removeItem(`chat:${chatId}`);
      
      const currentChatStr = sessionStorage.getItem('currentChat');
      if (currentChatStr) {
        const currentChat = JSON.parse(currentChatStr);
        if (currentChat.id === chatId) {
          sessionStorage.removeItem('currentChat');
        }
      }
    });
  }

  static async getChat(chatId: string): Promise<Chat | null> {
    return this.executeTransaction(async () => {
      console.log('🔍 [ChatStorageManager] Getting chat:', chatId);
      const chatStr = localStorage.getItem(`chat:${chatId}`);
      return chatStr ? JSON.parse(chatStr) : null;
    });
  }
}
