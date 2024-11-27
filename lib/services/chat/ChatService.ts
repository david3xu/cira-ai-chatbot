import { ProcessedDocument } from '@/lib/features/document/actions/processDocument';
import { toApiCase, fromApiCase } from '@/types/api/transformers';
import { Chat, ChatMessage, CreateChatPayload, SendMessagePayload } from '@/lib/types/chat/chat';
import { supabaseAdmin } from '@/lib/supabase/client';

export class ChatService {
  private static logError(method: string, error: unknown) {
    console.error(`ChatService.${method} error:`, error);
    throw error;
  }

  static async chatWithDocument(message: string, document: ProcessedDocument) {
    try {
      const context = this.prepareDocumentContext(document);
      const response = await fetch('/api/chat/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, document }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      return response.json();
    } catch (error) {
      this.logError('chatWithDocument', error);
      throw error;
    }
  }

  static async sendMessage(params: {
    message: string;
    chatId?: string;
    model: string;
    dominationField?: string;
    imageFile?: string;
    fileType?: string;
    messagePairId?: string;
    customPrompt?: string;
  }) {
    try {
      const payload: SendMessagePayload = {
        chatId: params.chatId || '',
        messagePairId: params.messagePairId || crypto.randomUUID(),
        dominationField: params.dominationField || 'Normal Chat',
        message: params.message,
        model: params.model,
        imageFile: params.imageFile || undefined,
        fileType: params.fileType || undefined,
        customPrompt: params.customPrompt || undefined
      };

      if (!payload.chatId) {
        throw new Error('chatId is required');
      }

      console.log('Sending message payload:', toApiCase(payload));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toApiCase(payload)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to send message');
      }

      return response;
    } catch (error) {
      this.logError('sendMessage', error);
      throw error;
    }
  }

  public static prepareDocumentContext(document: ProcessedDocument): string {
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

  static async createChat(inputData: Partial<Chat>): Promise<Chat> {
    try {
      const payload: CreateChatPayload = {
        model: inputData.model || 'llama3.1',
        domination_field: inputData.dominationField || 'Normal Chat',
        name: inputData.name || 'New Chat',
        user_id: '00000000-0000-0000-0000-000000000000',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
        custom_prompt: inputData.customPrompt || null,
        metadata: inputData.metadata || null
      };

      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const { success, data } = await response.json();
      console.log('Create chat response:', { success, data });
      
      if (!success || !data || !data.chat) {
        throw new Error('Server returned unsuccessful response');
      }

      const chatData = data.chat;
      const chat: Chat = {
        id: chatData.id,
        userId: chatData.user_id || '00000000-0000-0000-0000-000000000000',
        name: chatData.name,
        model: chatData.model,
        dominationField: chatData.domination_field,
        createdAt: chatData.created_at,
        updatedAt: chatData.updated_at,
        messages: chatData.messages || [],
        customPrompt: chatData.custom_prompt,
        metadata: chatData.metadata
      };

      // Persist chat immediately
      localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
      return chat;
    } catch (error) {
      this.logError('createChat', error);
      throw error;
    }
  }

  static async loadChatHistory(chatId: string): Promise<Chat> {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to load chat history');
      }

      const data = await response.json();
      return fromApiCase(data) as Chat;
    } catch (error) {
      this.logError('loadChatHistory', error);
      throw error;
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
      return response.json();
    } catch (error) {
      this.logError('updatePrompt', error);
      throw error;
    }
  }

  static async deleteChat(chatId: string) {
    try {
      const response = await fetch(`/api/chat/${chatId}`, { 
        method: 'DELETE' 
      });
      if (!response.ok) throw new Error('Failed to delete chat');
      return response.json();
    } catch (error) {
      this.logError('deleteChat', error);
      throw error;
    }
  }

  static async processMarkdown(params: {
    content: string;
    chatId?: string;
    model: string;
    dominationField: string;
    messagePairId: string;
  }) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          fileType: 'markdown'
        })
      });
      if (!response.ok) throw new Error('Failed to process markdown');
      return response;
    } catch (error) {
      this.logError('processMarkdown', error);
      throw error;
    }
  }

  static async storeMessage(message: ChatMessage): Promise<void> {
    console.log('Storing message in database:', {
      message,
      chatId: message.chatId,
      content: message.userContent
    });

    const { error, data } = await supabaseAdmin
      .from('chat_history')
      .insert({
        chat_id: message.chatId,
        message_pair_id: message.messagePairId,
        user_content: message.userContent,
        assistant_content: message.assistantContent,
        user_role: message.userRole,
        assistant_role: message.assistantRole || 'assistant',
        domination_field: message.dominationField || 'Normal Chat',
        model: message.model,
        custom_prompt: message.customPrompt || null,
        chat_topic: message.chatTopic || null,
        image_url: message.imageUrl || null,
        metadata: message.metadata || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    console.log('Store message result:', { error, data });
    
    if (error) {
      console.error('Database error:', error);
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

      console.log('Model updated:', {
        chatId,
        newModel,
        success: response.ok
      });

      return response.json();
    } catch (error) {
      this.logError('updateModel', error);
      throw error;
    }
  }

  static async getChat(chatId: string): Promise<Chat | null> {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }
      
      const data = await response.json();
      
      if (!data) return null;
      
      const chat: Chat = {
        id: data.id,
        userId: data.user_id || '00000000-0000-0000-0000-000000000000',
        name: data.name,
        model: data.model,
        dominationField: data.domination_field,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        messages: data.messages || [],
        customPrompt: data.custom_prompt,
        metadata: data.metadata || {},
        chatTopic: data.chat_topic,
        historyLoaded: true
      };

      return chat;
    } catch (error) {
      this.logError('getChat', error);
      throw error;
    }
  }

  static async updateMessage(messagePairId: string, updates: {
    assistantContent: string;
    status: 'sending' | 'failed' | 'success';
  }): Promise<void> {
    console.log('Updating message:', { messagePairId, updates });
    
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messagePairId, ...updates })
      });

      console.log('Update message response:', await response.clone().json());
      
      if (!response.ok) {
        throw new Error('Failed to update message');
      }
    } catch (error) {
      console.error('Update message error:', error);
      throw error;
    }
  }
} 