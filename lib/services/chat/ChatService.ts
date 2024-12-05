import { ProcessedDocument } from '@/lib/features/document/actions/processDocument';
import { toApiCase, fromApiCase } from '@/types/api/transformers';
import { Chat, ChatMessage, CreateNewChatParams, SendMessagePayload } from '@/lib/types/chat/chat';
import { storageActions } from '@/lib/features/chat/actions/storage';
import { API_ROUTES, APP_ROUTES } from '@/lib/config/routes';
import { StorageQueueManager } from '@/lib/features/chat/context/MessageQueueManager';
import { fetchChatHistory } from '@/lib/features/chat/actions/fetchHistory';
import { DOMINATION_FIELDS, DominationField } from '@/lib/features/ai/config/constants';
import { DEFAULT_MODEL } from '@/lib/features/ai/config/constants';

// Add this interface near the top with other interfaces
interface ProcessMarkdownParams {
  content: string;
  chatId?: string | null;
  model: string;
  dominationField: DominationField;
  messagePairId: string;
}

interface SendMessageParams {
  message: string;
  chatId: string;
  messagePairId: string;
  model: string;
  dominationField: DominationField;
  customPrompt?: string;
  imageFile?: File;
}

export class ChatService {
  private static loadingState = {
    current: false
  };

  private static setLoading(loading: boolean) {
    this.loadingState.current = loading;
    console.log('🔄 [ChatService] Loading state:', loading);
  }

  private static async withLoading<T>(operation: () => Promise<T>): Promise<T> {
    try {
      this.setLoading(true);
      return await operation();
    } finally {
      this.setLoading(false);
    }
  }

  private static async syncStorage<T>(operation: () => Promise<T>): Promise<T> {
    return StorageQueueManager.enqueueStorage(async () => {
      try {
        this.setLoading(true);
        return await operation();
      } finally {
        this.setLoading(false);
      }
    });
  }

  private static handleError(method: string, error: unknown) {
    console.error(`ChatService.${method} error:`, error);
    throw error instanceof Error ? error : new Error('An unknown error occurred');
  }

  static async createChat(params: CreateNewChatParams): Promise<Chat> {
    return this.withLoading(async () => {
      try {
        if (!params.source) {
          throw new Error('Chat creation requires a source');
        }

        const response = await fetch(API_ROUTES.CHAT.CREATE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toApiCase({
            model: params.model || 'null',
            dominationField: params.dominationField || 'Normal Chat',
            name: params.name || 'New Chat',
            customPrompt: params.customPrompt,
            metadata: params.metadata,
            source: params.source
          }))
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create chat');
        }

        const { data } = await response.json();
        const chat = fromApiCase(data.chat) as Chat;

        await StorageQueueManager.enqueueStorage(async () => {
          await Promise.all([
            storageActions.database.saveChat(chat),
            storageActions.persistent.saveChat(chat)
          ]);
          storageActions.session.setCurrentChat(chat);
        });

        return chat;
      } catch (error) {
        console.error('ChatService.createChat error:', error);
        throw error;
      }
    });
  }

  // Helper methods for specific creation scenarios
  static async createFromMessage(content: string, options: Partial<CreateNewChatParams> = {}): Promise<Chat> {
    const savedModel = localStorage.getItem('selectedModel');
    const defaultModel = savedModel && savedModel !== 'null' ? savedModel : DEFAULT_MODEL;
    
    const chat = await this.createChat({
      model: options.model || defaultModel,
      dominationField: options.dominationField || 'Normal Chat',
      source: 'input',
      name: content.slice(0, 30),
      metadata: {
        source: 'message_input',
        initialMessage: content,
        ...options.metadata
      },
      customPrompt: options.customPrompt || null
    });

    return chat;
  }

  static async createFromSidebar(options: Partial<CreateNewChatParams> = {}): Promise<Chat> {
    console.log('🔄 [ChatService] Creating chat from sidebar:', options);
    
    const chat = await this.createChat({
      model: options.model || 'null',
      dominationField: options.dominationField || 'Normal Chat',
      source: 'sidebar',
      name: 'New Chat',
      metadata: {
        source: 'sidebar_button',
        ...options.metadata
      },
      customPrompt: options.customPrompt || undefined
    });

    console.log('✅ [ChatService] Chat created:', {
      id: chat.id,
      model: chat.model,
      dominationField: chat.dominationField,
      hasCustomPrompt: !!chat.customPrompt
    });

    return chat;
  }

  static async createAndNavigate(params: CreateNewChatParams): Promise<Chat> {
    const chat = await this.createChat(params);
    await this.navigateToChat(chat.id);
    return chat;
  }

  // Chat Management Methods
  static async loadChat(chatId: string): Promise<Chat | null> {
    return this.withLoading(async () => {
      if (!chatId) {
        throw new Error('chat_id is required');
      }

      try {
        return await StorageQueueManager.enqueueStorage(async () => {
          const localChat = await storageActions.persistent.getChat(chatId);
          if (localChat) return localChat;

          const chat = await this.getChat(chatId);
          if (chat?.id) {
            await Promise.all([
              storageActions.persistent.saveChat(chat),
              storageActions.database.saveChat(chat)
            ]);
          }
          return chat;
        });
      } catch (error) {
        console.error('ChatService.loadChat error:', error);
        throw error;
      }
    });
  }

  static async deleteChat(chatId: string): Promise<void> {
    try {
      const response = await fetch(API_ROUTES.CHAT.DELETE(chatId), { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete chat');

      await this.syncStorage(async () => {
        await Promise.all([
          storageActions.database.deleteChat(chatId),
          storageActions.persistent.removeChat(chatId)
        ]);
        storageActions.session.setCurrentChat(null);
      });
    } catch (error) {
      this.handleError('deleteChat', error);
    }
  }

  // Message Methods
  static async sendMessage(params: SendMessageParams): Promise<Response> {
    const formData = new FormData();
    formData.append('message', params.message);
    formData.append('chatId', params.chatId);
    formData.append('messagePairId', params.messagePairId);
    formData.append('model', params.model || '');
    formData.append('dominationField', params.dominationField || DOMINATION_FIELDS.NORMAL_CHAT);
    
    if (params.customPrompt) {
      formData.append('customPrompt', params.customPrompt);
    }

    try {
      const response = await fetch(API_ROUTES.CHAT.SEND_MESSAGE, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'text/event-stream',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send message' }));
        throw new Error(errorData.message || 'Failed to send message');
      }

      return response;
    } catch (error) {
      this.handleError('sendMessage', error);
      throw error;
    }
  }

  static async saveMessage(message: ChatMessage): Promise<void> {
    try {
      await this.syncStorage(async () => {
        await Promise.all([
          storageActions.database.saveMessage(message),
          storageActions.persistent.saveMessage(message, message.chatId)
        ]);

        const currentChat = await storageActions.session.getChat(message.chatId);
        if (currentChat) {
          const updatedChat = {
            ...currentChat,
            messages: [...(currentChat.messages || []), message],
            updatedAt: new Date().toISOString()
          };
          await storageActions.session.setChat(message.chatId, updatedChat);
        }
      });
    } catch (error) {
      this.handleError('saveMessage', error);
    }
  }

  static async updateMessage(messagePairId: string, updates: {
    assistantContent: string;
    status: 'sending' | 'failed' | 'success';
  }): Promise<void> {
    try {
      await this.syncStorage(async () => {
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

        await Promise.all([
          storageActions.database.saveMessage(updatedMessage),
          storageActions.persistent.saveMessage(updatedMessage, chat.id),
          storageActions.session.updateChat(chat.id, (existingChat) => ({
            ...existingChat,
            messages: existingChat.messages.map(m => 
              m.messagePairId === messagePairId ? updatedMessage : m
            )
          }))
        ]);
      });
    } catch (error) {
      this.handleError('updateMessage', error);
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

  static async updatePrompt(chatId: string, customPrompt: string): Promise<Chat> {
    if (!chatId) {
      throw new Error('chat_id is required');
    }

    try {
      // Update chat table
      const response = await fetch(API_ROUTES.CHAT.UPDATE_PROMPT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, customPrompt })
      });
      if (!response.ok) throw new Error('Failed to update prompt');
      
      const { data } = await response.json();
      const chat = fromApiCase(data.chat) as Chat;
      
      // Update both chat and chat_history tables
      await this.syncStorage(async () => {
        await Promise.all([
          storageActions.database.saveChat(chat),
          storageActions.database.updateChatHistoryPrompt(chatId, customPrompt),
          storageActions.persistent.saveChat(chat)
        ]);
      });
      
      return chat;
    } catch (error) {
      this.handleError('updatePrompt', error);
      throw error;
    }
  }

  static async updateModel(chatId: string, newModel: string): Promise<Chat> {
    if (!chatId) {
      throw new Error('chat_id is required');
    }

    try {
      // Only update the chat's model setting
      const response = await fetch(API_ROUTES.CHAT.UPDATE_MODEL(chatId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: newModel,
          chatId: chatId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update model');
      }

      const { data } = await response.json();
      const chatData = fromApiCase(data.chat) as Chat;
      
      // Get existing chat with messages
      const existingChat = await storageActions.database.fetchChatHistory(chatId);
      
      // Create updated chat object preserving original message models
      const updatedChat: Chat = {
        ...chatData,
        id: chatId,
        userId: chatData.userId,
        name: chatData.name,
        createdAt: chatData.createdAt,
        updatedAt: new Date().toISOString(),
        model: newModel,
        dominationField: chatData.dominationField,
        customPrompt: chatData.customPrompt,
        metadata: chatData.metadata,
        messages: existingChat.data?.map(msg => ({
          ...msg,
          // Explicitly keep original model for each message
          model: msg.model
        })) || []
      };

      // Update storage without modifying message models
      await this.syncStorage(async () => {
        await Promise.all([
          storageActions.database.saveChat(updatedChat),
          storageActions.persistent.saveChat(updatedChat)
        ]);
      });

      return updatedChat;
    } catch (error) {
      this.handleError('updateModel', error);
      throw error;
    }
  }

  static async getChat(chatId: string): Promise<Chat | null> {
    if (!chatId) {
      throw new Error('chat_id is required');
    }

    try {
      const response = await fetch(API_ROUTES.CHAT.GET(chatId));
      if (!response.ok) throw new Error('Failed to fetch chat');
      
      const data = await response.json();
      if (!data) return null;
      
      return fromApiCase(data) as Chat;
    } catch (error) {
      this.handleError('getChat', error);
      throw error;
    }
  }

  static async navigateToChat(chatId: string): Promise<void> {
    try {
      window.location.href = APP_ROUTES.CHAT.VIEW(chatId);
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      this.handleError('navigateToChat', error);
      throw error;
    }
  }

  static async processMarkdown(params: ProcessMarkdownParams): Promise<Response> {
    try {
      if (!params.content) {
        throw new Error('Markdown content is required');
      }

      const response = await fetch(API_ROUTES.CHAT.PROCESS_MARKDOWN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          content: params.content,
          chat_id: params.chatId || null,
          message_pair_id: params.messagePairId,
          model: params.model || 'null',
          domination_field: params.dominationField || 'Normal Chat'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ChatService: Error processing markdown:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      this.handleError('processMarkdown', error);
      throw error;
    }
  }

  static async getChatHistory(chatId: string): Promise<{ messages: ChatMessage[] }> {
    if (!chatId) {
      throw new Error('chat_id is required');
    }

    try {
      const { data: messages, error } = await fetchChatHistory(chatId);
      
      if (error) {
        throw error;
      }

      return { messages: messages || [] };
    } catch (error) {
      this.handleError('getChatHistory', error);
      throw error;
    }
  }

  static async updateChatName(chatId: string, newName: string): Promise<Chat> {
    if (!chatId) {
      throw new Error('chat_id is required');
    }

    try {
      const response = await fetch(API_ROUTES.CHAT.UPDATE_NAME(chatId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, name: newName })
      });
      
      if (!response.ok) throw new Error('Failed to update chat name');
      
      const { data } = await response.json();
      const chat = fromApiCase(data.chat) as Chat;
      
      await this.syncStorage(async () => {
        await Promise.all([
          storageActions.database.saveChat(chat),
          storageActions.persistent.saveChat(chat)
        ]);
      });
      
      return chat;
    } catch (error) {
      this.handleError('updateChatName', error);
      throw error;
    }
  }

  static async updateChat(updates: Partial<Chat> & { id: string }): Promise<Chat> {
    if (!updates.id) {
      throw new Error('chat_id is required');
    }

    try {
      // Use the existing UPDATE_NAME route for general updates
      const response = await fetch(API_ROUTES.CHAT.UPDATE_NAME(updates.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toApiCase({
          chatId: updates.id,
          ...updates
        }))
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update chat');
      }

      const { data } = await response.json();
      const chatData = fromApiCase(data.chat) as Chat;

      // Get existing chat with messages
      const existingChat = await storageActions.database.fetchChatHistory(updates.id);

      // Create updated chat object preserving messages
      const updatedChat: Chat = {
        ...chatData,
        messages: existingChat.data || [],
        updatedAt: new Date().toISOString()
      };

      // Update storage
      await this.syncStorage(async () => {
        await Promise.all([
          storageActions.database.saveChat(updatedChat),
          storageActions.persistent.saveChat(updatedChat)
        ]);
      });

      return updatedChat;
    } catch (error) {
      this.handleError('updateChat', error);
      throw error;
    }
  }
}