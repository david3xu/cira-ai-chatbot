import { ProcessedDocument } from '@/lib/features/document/actions/processDocument';
import { toApiCase, fromApiCase } from '@/types/api/transformers';
import { Chat, ChatMessage, CreateNewChatParams, SendMessagePayload } from '@/lib/types/chat/chat';
import { storageActions } from '@/lib/features/chat/actions/storage';

export class ChatService {
  private static logError(method: string, error: unknown) {
    console.error(`ChatService.${method} error:`, error);
    throw error;
  }

  // Chat Creation Methods
  static async createChat(params: CreateNewChatParams): Promise<Chat> {
    try {
      if (!params.source) {
        throw new Error('Chat creation requires a source');
      }

      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toApiCase(params))
      });

      if (!response.ok) throw new Error('Failed to create chat');

      const { data } = await response.json();
      const chat = fromApiCase(data.chat) as Chat;

      // Use storage actions
      await storageActions.database.saveChat(chat);
      storageActions.persistent.saveChat(chat);
      storageActions.session.setCurrentChat(chat);

      return chat;
    } catch (error) {
      this.logError('createChat', error);
      throw error;
    }
  }

  static async createChatFromInput(content: string, model: string, dominationField: string): Promise<Chat> {
    return this.createChat({
      model,
      dominationField,
      source: 'input',
      name: content.slice(0, 30),
      metadata: {
        source: 'message_input',
        initialMessage: content
      },
      customPrompt: null
    });
  }

  static async createChatFromSidebar(model: string, dominationField: string): Promise<Chat> {
    return this.createChat({
      model,
      dominationField,
      source: 'sidebar',
      name: 'New Chat',
      metadata: {
        source: 'sidebar_button'
      },
      customPrompt: null
    });
  }

  // Chat Management Methods
  static async loadChat(chatId: string): Promise<Chat | null> {
    try {
      // Try localStorage first via persistent actions
      const localChat = await storageActions.persistent.getChat(chatId);
      if (localChat) return localChat;

      // Fallback to API
      const chat = await this.getChat(chatId);
      if (chat?.id) {
        storageActions.persistent.saveChat(chat);
      }
      return chat;
    } catch (error) {
      this.logError('loadChat', error);
      throw error;
    }
  }

  static async deleteChat(chatId: string): Promise<void> {
    try {
      const response = await fetch(`/api/chat/${chatId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete chat');

      await storageActions.database.deleteChat(chatId);
      storageActions.persistent.removeChat(chatId);
      storageActions.session.setCurrentChat(null);
    } catch (error) {
      this.logError('deleteChat', error);
      throw error;
    }
  }

  // Message Methods
  static async sendMessage(params: SendMessagePayload): Promise<Response> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toApiCase(params))
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      return response;
    } catch (error) {
      this.logError('sendMessage', error);
      throw error;
    }
  }

  static async saveMessage(message: ChatMessage): Promise<void> {
    try {
      // Save to database
      await storageActions.database.saveMessage(message);
      
      // Update local storage
      storageActions.persistent.saveMessage(message, message.chatId);
      
      // Update session storage for immediate access
      const currentChat = sessionStorage.getItem(`chat_${message.chatId}`);
      if (currentChat) {
        const chat = JSON.parse(currentChat);
        chat.messages = [...(chat.messages || []), message];
        sessionStorage.setItem(`chat_${message.chatId}`, JSON.stringify(chat));
      }
    } catch (error) {
      this.logError('saveMessage', error);
      throw error;
    }
  }

  static async updateMessage(messagePairId: string, updates: {
    assistantContent: string;
    status: 'sending' | 'failed' | 'success';
  }): Promise<void> {
    try {
      const chat = await this.getChatByMessageId(messagePairId);
      if (!chat) throw new Error('Chat not found for message');

      const message = chat.messages.find(m => m.messagePairId === messagePairId);
      if (!message) throw new Error('Message not found');

      const updatedMessage = {
        ...message,
        assistantContent: updates.assistantContent,
        status: updates.status,
        updatedAt: new Date().toISOString()
      };

      await this.saveMessage(updatedMessage);
    } catch (error) {
      this.logError('updateMessage', error);
      throw error;
    }
  }

  // Helper method to find chat by message ID
  private static async getChatByMessageId(messagePairId: string): Promise<Chat | null> {
    const { data: chat } = await storageActions.database.fetchChats();
    return chat ? fromApiCase(chat) as Chat : null;
  }

  // Utility Methods
  static prepareDocumentContext(document: ProcessedDocument): string {
    switch (document.contentType) {
      case 'pdf':
        return `Analyzing PDF: "${document.metadata.type}" (${document.metadata.wordCount} words)`;
      case 'image':
        return `Analyzing image: "${document.metadata.type}"`;
      case 'markdown':
        return `Analyzing markdown: "${document.metadata.type}"`;
      default:
        return `Analyzing document: "${document.metadata.type}"`;
    }
  }

  static async updatePrompt(chatId: string, customPrompt: string) {
    try {
      const response = await fetch('/api/chat/update-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, customPrompt })
      });
      if (!response.ok) throw new Error('Failed to update prompt');
      
      const data = await response.json();
      const chat = fromApiCase(data.chat) as Chat;
      
      await storageActions.database.saveChat(chat);
      storageActions.persistent.saveChat(chat);
      
      return chat;
    } catch (error) {
      this.logError('updatePrompt', error);
      throw error;
    }
  }

  static async updateModel(chatId: string, newModel: string) {
    try {
      const response = await fetch(`/api/chat/${chatId}/model`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update model');
      }

      const data = await response.json();
      const chat = fromApiCase(data.chat) as Chat;
      
      await storageActions.database.saveChat(chat);
      storageActions.persistent.saveChat(chat);

      return chat;
    } catch (error) {
      this.logError('updateModel', error);
      throw error;
    }
  }

  static async getChat(chatId: string): Promise<Chat | null> {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch chat');
      
      const data = await response.json();
      if (!data) return null;
      
      return fromApiCase(data) as Chat;
    } catch (error) {
      this.logError('getChat', error);
      throw error;
    }
  }
} 