import { supabaseAdmin } from '@/lib/supabase/client';
import { Chat, ChatMessage } from '@/lib/types/chat/chat';
import { toApiCase } from '@/types/api/transformers';

export const databaseActions = {
  // Chat operations
  saveChat: async (chat: Chat) => {
    // First insert into chats table
    const { error } = await supabaseAdmin
      .from('chats')
      .upsert({
        id: chat.id,
        name: chat.name,
        model: chat.model,
        custom_prompt: chat.customPrompt,
        domination_field: chat.dominationField,
        metadata: chat.metadata,
        updated_at: new Date().toISOString()
      });
    if (error) throw error;
  },
  
  // Message operations
  saveMessage: async (message: ChatMessage) => {
    const { error } = await supabaseAdmin.rpc('store_chat_message', {
      message_data: toApiCase(message)
    });
    if (error) throw error;
  },
  
  // Transaction operations
  beginTransaction: async (chatId: string) => {
    const { data, error } = await supabaseAdmin.rpc('begin_chat_transaction', {
      chat_id: chatId
    });
    if (error) throw error;
    return data;
  },

  commitTransaction: async (chatId: string) => {
    const { data, error } = await supabaseAdmin.rpc('commit_chat_transaction', {
      chat_id: chatId
    });
    if (error) throw error;
    return data;
  },

  rollbackTransaction: async (chatId: string) => {
    const { data, error } = await supabaseAdmin.rpc('rollback_chat_transaction', {
      chat_id: chatId
    });
    if (error) throw error;
    return data;
  },
  
  // Fetch operations
  fetchChats: async () => {
    return await supabaseAdmin
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });
  },

  fetchChatHistory: async (chatId: string) => {
    return await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
  },
  
  // Delete operations
  deleteChat: async (chatId: string) => {
    const { error } = await supabaseAdmin
      .from('chats')
      .delete()
      .match({ id: chatId });
    if (error) throw error;
  }
};
