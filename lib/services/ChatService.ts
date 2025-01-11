/**
 * Chat Service
 * 
 * Handles all chat-related operations:
 * - Message management
 * - Streaming responses
 * - Error handling
 */

import { ApiService } from './base/ApiService';
import type { Chat, ChatOptions, ChatStreamOptions, ChatMessage, ChatResponse } from '@/lib/types/chat';
import { CircuitBreaker } from '@/lib/utils/circuit-breaker';
import { ChatError, ErrorCodes } from '@/lib/types/errors';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/supabase/types/database.types';
import { transformDatabaseMessage } from '@/lib/utils/messageTransformer';
import { DEFAULT_PROMPT } from '@/lib/features/ai/config/constants';
import { ChatAction } from '@/lib/types/chat-action';

interface MessageResponse extends Response {
  messages?: ChatMessage[];
}

export class ChatService extends ApiService {
  private static supabase = createClientComponentClient<Database>({
    options: {
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    }
  });

  private static messageBreaker = new CircuitBreaker(
    async (content: string, options?: ChatStreamOptions) => {
      const response = await fetch('/api/messages/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ content, options })
      });

      if (!response.ok) {
        throw new ChatError(
          'Failed to send message',
          ErrorCodes.API_ERROR,
          { status: response.status }
        );
      }

      return response;
    },
    {
      timeout: 30000,
      resetTimeout: 60000,
      errorThreshold: 3
    }
  );

  // Core message operations
  static async sendMessage(content: string, options?: ChatStreamOptions): Promise<MessageResponse> {
    if (!content.trim()) {
      throw new ChatError(
        'Message content is required',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!options?.chatId) {
      throw new ChatError(
        'Chat ID is required',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const messagePairId = options.messagePairId || crypto.randomUUID();

    console.log('🔍 [ChatService.sendMessage] Starting with options:', {
      messagePairId,
      chatId: options.chatId,
      model: options.model,
      dominationField: options.dominationField,
      hasCustomPrompt: !!options.customPrompt,
      customPromptPreview: options.customPrompt ? `${options.customPrompt.slice(0, 50)}...` : null
    });

    try {
      if (!messagePairId || !options.model || !options.chatId) {
        throw new Error('Missing required parameters');
      }

      // If dominationField is not provided, fetch it from the chat
      if (!options.dominationField) {
        const { data: chat, error: chatError } = await this.supabase
          .from('chats')
          .select('domination_field')
          .eq('id', options.chatId)
          .single();

        if (chatError) throw chatError;
        options.dominationField = chat.domination_field;
      }

      if (!options.dominationField) {
        throw new Error('Could not determine domination field');
      }

      // Create message pair using stored procedure
      const { data: newMessages, error: dbError } = await this.supabase
        .rpc('create_message_pair', {
          p_message_pair_id: messagePairId,
          p_content: content,
          p_model: options.model,
          p_chat_id: options.chatId,
          p_domination_field: options.dominationField,
          p_custom_prompt: options.customPrompt || undefined,
          p_chat_topic: options.chatTopic || undefined
        });

      if (dbError) throw dbError;
      if (!newMessages?.length) throw new Error('Failed to create message pair');

      const transformedMessage = transformDatabaseMessage(newMessages[0]);

      console.log('🔍 [ChatService.sendMessage] Sending to API:', {
        model: options.model,
        dominationField: options.dominationField,
        messageCount: newMessages.length
      });

      // Send message to API for processing
      try {
        const response = await fetch('/api/messages/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify({ 
            content, 
            options: {
              ...options,
              messagePairId,
              model: options.model,
              dominationField: options.dominationField,
              customPrompt: options.customPrompt
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });

          // Update message status using stored procedure
          await this.supabase
            .rpc('update_message_pair_status', {
              p_message_pair_id: messagePairId,
              p_status: 'failed',
              p_error_message: `API error: ${response.status} - ${errorText}`
            });

          throw new ChatError(
            'Failed to send message',
            ErrorCodes.API_ERROR,
            { status: response.status, error: errorText }
          );
        }

        // Process streaming response
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let streamingContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode chunk and process SSE messages
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            let currentJson = '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (!data || data === '[DONE]') continue;

                currentJson += data;
                
                try {
                  const parsed = this.tryParseStreamJson(currentJson);
                  
                  if (Object.keys(parsed).length === 0) {
                    // Incomplete JSON, keep accumulating
                    continue;
                  }
                  
                  // Reset current JSON since we successfully parsed
                  currentJson = '';

                  if (parsed.content) {
                    streamingContent = parsed.content;
                    
                    // Send streaming update to UI
                    options.onMessage?.({
                      id: messagePairId,
                      chatId: options.chatId,
                      messagePairId,
                      userContent: content,
                      assistantContent: streamingContent,
                      userRole: 'user',
                      assistantRole: 'assistant',
                      status: 'streaming',
                      model: options.model || 'default',
                      dominationField: options.dominationField || 'NORMAL_CHAT',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      metadata: options.metadata || {}
                    });
                  }

                  // Handle chat topic update
                  if (parsed.chat_topic && options.chatId) {
                    console.log('📝 Updating chat name with topic:', parsed.chat_topic);
                    try {
                      // Get current chat data
                      const { data: currentChat } = await this.supabase
                        .from('chats')
                        .select('*')
                        .eq('id', options.chatId)
                        .single();

                      if (currentChat) {
                        const now = new Date().toISOString();
                        
                        // Create a properly formatted Chat object with the new topic
                        // but preserve current messages
                        const updatedChatData = {
                          id: currentChat.id,
                          name: parsed.chat_topic,
                          userId: currentChat.user_id!,
                          createdAt: currentChat.created_at!,
                          updatedAt: now,
                          model: currentChat.model,
                          custom_prompt: currentChat.custom_prompt,
                          domination_field: currentChat.domination_field,
                          metadata: (currentChat.metadata as Record<string, any>) || {},
                          // Don't fetch messages - let the reducer handle message state
                          messages: []
                        };

                        // Update chat state
                        if (options.onChatUpdate) {
                          console.log('🔄 Dispatching chat update:', {
                            id: updatedChatData.id,
                            name: updatedChatData.name,
                            preservingMessages: true
                          });
                          
                          options.onChatUpdate({
                            type: 'UPDATE_CHAT',
                            payload: updatedChatData
                          });

                          console.log('🔄 Chat update dispatched with new name:', updatedChatData.name);
                        }
                      }
                    } catch (error) {
                      console.error('Error updating chat name:', error);
                    }
                  }

                  // Handle final message
                  if (parsed.status === 'success') {
                    // Complete message pair using stored procedure
                    const { error: completeError } = await this.supabase
                      .rpc('complete_message_pair', {
                        p_message_pair_id: messagePairId,
                        p_assistant_content: streamingContent,
                        p_metadata: {
                          ...options.metadata,
                          lastUpdated: new Date().toISOString(),
                          status: 'success',
                          chat_topic: parsed.chat_topic || null
                        }
                      });

                    if (completeError) {
                      console.error('Failed to complete message pair:', completeError);
                      throw completeError;
                    }

                    // Send final message update
                    options.onMessage?.({
                      id: messagePairId,
                      chatId: options.chatId,
                      messagePairId,
                      userContent: content,
                      assistantContent: streamingContent,
                      userRole: 'user',
                      assistantRole: 'assistant',
                      status: 'success',
                      model: options.model || 'default',
                      dominationField: options.dominationField || 'NORMAL_CHAT',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      metadata: options.metadata || {}
                    });
                  }

                  // Handle error
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch (error) {
                  if (error instanceof SyntaxError) {
                    // JSON parsing error, continue accumulating
                    continue;
                  }
                  console.warn('Failed to process SSE message:', error);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
          type: 'default',
          url: '',
          messages: [{
            id: messagePairId,
            chatId: options.chatId,
            messagePairId,
            userContent: content,
            assistantContent: streamingContent,
            userRole: 'user',
            assistantRole: 'assistant',
            status: 'success',
            model: options.model || 'default',
            dominationField: options.dominationField || 'NORMAL_CHAT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: options.metadata || {}
          }],
          json: async () => ({ messages: [transformedMessage] }),
          text: async () => JSON.stringify({ messages: [transformedMessage] }),
          blob: async () => new Blob([JSON.stringify({ messages: [transformedMessage] })]),
          formData: async () => {
            throw new Error('FormData not supported');
          },
          arrayBuffer: async () => new TextEncoder().encode(JSON.stringify({ messages: [transformedMessage] })).buffer,
          bodyUsed: false,
          body: null,
          clone: function() { return this; }
        } as MessageResponse;

      } catch (error) {
        // Cancel message pair using stored procedure
        await this.supabase
          .rpc('cancel_message_pair', {
            p_message_pair_id: messagePairId,
            p_reason: error instanceof Error ? error.message : 'Stream processing failed'
          });

        options.onError?.(error instanceof Error ? error : new Error('Stream processing failed'));
        throw error;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  static async getMessages(chatId: string): Promise<ChatMessage[]> {
    return this.get(`/api/chat/${chatId}/messages`);
  }

  static async updateMessage(messageId: string, content: string): Promise<void> {
    return this.put(`/api/messages/${messageId}`, { content });
  }

  static async deleteMessage(messageId: string): Promise<void> {
    return this.delete(`/api/messages/${messageId}`);
  }

  // Chat management
  static async createChat(options: ChatOptions = {}): Promise<Chat> {
    if (!options.model) {
      throw new ChatError(
        'Model is required',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!options.dominationField) {
      throw new ChatError(
        'Domination field is required',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Let getSystemMessage handle the prompt hierarchy
    const customPrompt = options.customPrompt || null;

    console.log('🏗️ [ChatService.createChat] Creating chat with options:', {
      model: options.model,
      name: options.name || options.title || 'New Chat',
      dominationField: options.dominationField,
      hasCustomPrompt: !!options.customPrompt,
      customPromptPreview: customPrompt ? `${customPrompt.slice(0, 50)}...` : null
    });

    // Create chat in database first
    const { data: chat, error: dbError } = await this.supabase
      .from('chats')
      .insert({
        model: options.model,
        name: options.name || options.title || 'New Chat',
        domination_field: options.dominationField,
        custom_prompt: customPrompt,
        metadata: {
          customPromptSource: options.customPrompt ? 'user' : 'default'
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to create chat:', dbError);
      throw new ChatError(
        'Failed to create chat',
        ErrorCodes.DB_ERROR,
        { error: dbError }
      );
    }

    // Return the created chat
    return {
      ...chat,
      messages: [],
      userId: chat.user_id!,
      createdAt: chat.created_at!,
      updatedAt: chat.updated_at!,
      custom_prompt: chat.custom_prompt,
      domination_field: chat.domination_field,
      metadata: (chat.metadata as Record<string, any>) || {}
    };
  }

  static async getChat(chatId: string): Promise<Chat> {
    try {
      const { data: chat, error: chatError } = await this.supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) {
        if (chatError.code === 'PGRST116') {
          throw new ChatError('Chat not found', ErrorCodes.NOT_FOUND);
        }
        throw chatError;
      }

      if (!chat) {
        throw new ChatError('Chat not found', ErrorCodes.NOT_FOUND);
      }

      // Use the new RPC function for messages
      const { data: messages, error: messagesError } = await this.supabase
        .rpc('get_chat_messages', { p_chat_id: chatId });

      if (messagesError) throw messagesError;

      return {
        ...chat,
        messages: messages?.map(transformDatabaseMessage) || [],
        userId: chat.user_id!,
        createdAt: chat.created_at!,
        updatedAt: chat.updated_at!,
        metadata: (chat.metadata as Record<string, any>) || {}
      };
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      if (error instanceof ChatError) {
        throw error;
      }
      throw new ChatError('Failed to fetch chat', ErrorCodes.DB_ERROR);
    }
  }

  static async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update chat');
    }
    
    return response.json();
  }

  static async deleteChat(chatId: string): Promise<boolean> {
    try {
      console.log('🗑️ Attempting to delete chat:', chatId);
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete chat:', { status: response.status, error: errorData });
        throw new ChatError(
          errorData.error || 'Failed to delete chat',
          ErrorCodes.API_ERROR,
          { status: response.status }
        );
      }

      const result = await response.json();
      console.log('🎉 Chat deleted successfully:', { chatId, result });
      return true;
    } catch (error) {
      console.error('❌ Error in deleteChat:', error);
      throw error;
    }
  }

  // Streaming support
  static async abortStream(streamId: string): Promise<void> {
    try {
      await this.post('/api/messages/abort', { streamId });
    } catch (error) {
      throw new ChatError(
        'Failed to abort stream',
        ErrorCodes.ABORT_ERROR,
        { streamId }
      );
    }
  }

  private static async processStream(
    body: ReadableStream<Uint8Array>,
    options: ChatStreamOptions
  ): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let updateTimeout: NodeJS.Timeout | null = null;
    let accumulatedContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { complete, remainder } = this.parseStreamMessages(buffer);
        buffer = remainder;

        // Accumulate content
        accumulatedContent += complete.join('');

        // Debounce updates to reduce rerenders
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }

        updateTimeout = setTimeout(async () => {
          if (!options.messagePairId) return;
          
          try {
            // Update message pair with streaming content
            await this.supabase
              .rpc('complete_message_pair', {
                p_message_pair_id: options.messagePairId,
                p_assistant_content: accumulatedContent,
                p_metadata: { status: 'streaming' }
              });
          } catch (error) {
            console.error('Failed to update message:', error);
          }
        }, 100); // Batch updates every 100ms
      }

      // Final update
      if (accumulatedContent && options.messagePairId) {
        await this.supabase
          .rpc('complete_message_pair', {
            p_message_pair_id: options.messagePairId,
            p_assistant_content: accumulatedContent,
            p_metadata: { status: 'complete' }
          });
      }

    } catch (error) {
      console.error('Stream processing error:', error);
      throw error;
    } finally {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      reader.releaseLock();
    }
  }

  private static parseStreamMessages(buffer: string): {
    complete: string[];
    remainder: string;
  } {
    const complete: string[] = [];
    const lines = buffer.split('\n');
    let remainder = lines.pop() || '';
    let currentJson = '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;

        try {
          // Attempt to build complete JSON objects
          currentJson += data;
          
          // Check if we have a complete JSON object
          try {
            const parsed = JSON.parse(currentJson);
            const content = parsed.content || parsed.choices?.[0]?.delta?.content;
            if (content) complete.push(content);
            currentJson = ''; // Reset for next object
          } catch (e) {
            // If it's not valid JSON yet, keep accumulating
            if (!(e instanceof SyntaxError)) {
              console.warn('Unexpected error parsing stream:', e);
              currentJson = ''; // Reset on unexpected error
            }
            // Otherwise keep accumulating
          }
        } catch (e) {
          console.warn('Failed to process stream message:', e);
          currentJson = ''; // Reset on error
        }
      }
    }

    // Handle any remaining partial JSON
    if (currentJson) {
      remainder = currentJson;
    }

    return { complete, remainder };
  }

  private static isValidJson(str: string): boolean {
    if (!str) return false;
    try {
      const parsed = JSON.parse(str);
      return typeof parsed === 'object' && parsed !== null;
    } catch (e) {
      return false;
    }
  }

  private static tryParseStreamJson(data: string): { content?: string; error?: string; status?: string; chat_topic?: string } {
    try {
      const parsed = JSON.parse(data);
      return {
        content: parsed.content || parsed.choices?.[0]?.delta?.content,
        error: parsed.error,
        status: parsed.status,
        chat_topic: parsed.chat_topic
      };
    } catch (e) {
      return {};
    }
  }

  static async updateDomainConfig(
    field: string,
    scoring: {
      similarityWeight?: number;
      recencyWeight?: number;
      popularityWeight?: number;
    }
  ): Promise<void> {
    return this.post('/api/config/domain', {
      field,
      scoring
    });
  }

  static async getDomainConfig(field: string) {
    return this.get(`/api/config/domain/${field}`);
  }

  static async regenerateMessage(messageId: string): Promise<ChatMessage> {
    return this.post<ChatMessage>(`/api/messages/${messageId}/regenerate`);
  }

  static async updateSettings(updates: Partial<ChatOptions>): Promise<void> {
    return this.post('/api/chat/settings', updates);
  }

  static async clearHistory(): Promise<void> {
    return this.post('/api/chat/clear-history');
  }

  public static async refreshSession() {
    return ApiService.refreshSession();
  }

  static async storeMessage(message: ChatMessage): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('create_message_pair', {
          p_message_pair_id: message.messagePairId,
          p_content: message.userContent,
          p_model: message.model,
          p_chat_id: message.chatId,
          p_domination_field: message.dominationField
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store message:', error);
      throw new Error('Failed to store message');
    }
  }

  // Chat management
  static async getAllChats(): Promise<Chat[]> {
    const maxRetries = 3;
    const retryDelay = 500; // 500ms
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const { data: chats, error } = await this.supabase
          .from('chats')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          // If it's a temporary error (like 503), retry
          if (error.code === '503' && retries < maxRetries - 1) {
            console.log(`Failed to fetch chats, retrying in ${retryDelay}ms... (${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            retries++;
            continue;
          }
          throw error;
        }

        return chats.map(chat => ({
          id: chat.id,
          name: chat.name || '',
          userId: chat.user_id!,
          createdAt: chat.created_at!,
          updatedAt: chat.updated_at!,
          messages: [],
          model: chat.model || '',
          custom_prompt: chat.custom_prompt || '',
          domination_field: chat.domination_field || 'NORMAL_CHAT',
          metadata: (chat.metadata as Record<string, any>) || {}
        }));
      } catch (error) {
        // On last retry or non-temporary error, throw
        if (retries === maxRetries - 1 || !(error instanceof Error && error.message.includes('503'))) {
          console.error('Failed to fetch chats:', error);
          throw new ChatError('Failed to fetch chats', ErrorCodes.DB_ERROR);
        }
        console.log(`Failed to fetch chats, retrying in ${retryDelay}ms... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retries++;
      }
    }

    // This should never be reached due to the throw in the catch block
    throw new ChatError('Failed to fetch chats after retries', ErrorCodes.DB_ERROR);
  }

  async updateChatTopic(chatId: string, topic: string, options: ChatStreamOptions) {
    try {
      const { data: currentChat } = await ChatService.supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (currentChat?.name !== topic) {
        const { data: updatedChat, error } = await ChatService.supabase
          .from('chats')
          .update({
            name: topic,
            updated_at: new Date().toISOString(),
          })
          .eq('id', chatId)
          .select('*')
          .single();

        if (error) {
          throw error;
        }

        // Update chat_topic in chat_history table
        await ChatService.supabase
          .from('chat_history')
          .update({ chat_topic: topic })
          .eq('chat_id', chatId);

        if (options.onChatUpdate && updatedChat) {
          // Get the latest messages for the chat
          const { data: messages } = await ChatService.supabase
            .rpc('get_chat_messages', { p_chat_id: chatId });

          console.log('🔍 Fetched messages for chat update:', {
            messageCount: messages?.length || 0,
            chatId,
            topic
          });

          // Create a properly formatted Chat object with the new topic
          const chatUpdate = {
            id: updatedChat.id,
            name: topic,
            userId: updatedChat.user_id || '',
            createdAt: updatedChat.created_at || '',
            updatedAt: new Date().toISOString(),
            custom_prompt: updatedChat.custom_prompt || '',
            domination_field: updatedChat.domination_field || 'General',
            metadata: updatedChat.metadata as Record<string, any> | null,
            model: updatedChat.model || 'default',
            messages: messages?.map(transformDatabaseMessage) || []
          };

          console.log('📝 Dispatching chat update:', {
            chatId: chatUpdate.id,
            name: chatUpdate.name,
            messageCount: chatUpdate.messages.length
          });

          // Dispatch the chat update using UPDATE_CHAT action
          options.onChatUpdate({
            type: 'UPDATE_CHAT',
            payload: chatUpdate
          });
        }

        console.log('🏷️ Updated chat name with topic:', topic);
        return updatedChat;
      }
      return currentChat;
    } catch (error) {
      console.error('Failed to update chat topic:', error);
      throw error;
    }
  }
}
