import { supabase } from '@/lib/supabase/client';
import { Chat, ChatMessage, ChatUpdate } from '@/lib/types/chat/chat';
import { toApiCase } from '@/types/api/transformers';
import { PostgrestError } from '@supabase/supabase-js';

interface TransactionError extends Error {
  data?: {
    transaction_id?: string;
  };
}

export const databaseActions = {
  // Chat operations
  saveChat: async (chat: Chat) => {
    if (!chat.id) {
      throw new Error('chat_id is required');
    }

    try {
      // Start transaction using direct table operations
      const { data, error } = await supabase
        .from('stale_transactions')
        .insert([{  // Using array syntax for insert
          chat_id: chat.id,
          status: 'started'
        }])
        .select('transaction_id')
        .single();
      
      if (error) throw error;
      
      const { error: upsertError } = await supabase
        .from('chats')
        .upsert({
          id: chat.id,
          name: chat.name || 'New Chat',
          model: chat.model || 'null',
          custom_prompt: chat.customPrompt,
          domination_field: chat.dominationField || 'Normal Chat',
          metadata: chat.metadata || {},
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      // Commit transaction using direct table operations
      const { error: commitError } = await supabase
        .from('stale_transactions')
        .update({ 
          status: 'committed',
          cleaned_at: new Date().toISOString()
        })
        .eq('transaction_id', data.transaction_id)
        .eq('status', 'started');

      if (commitError) throw commitError;
    } catch (error) {
      // Rollback on error using direct table operations
      const txError = error as TransactionError;
      if (txError.data?.transaction_id) {
        await supabase
          .from('stale_transactions')
          .update({ 
            status: 'rolled_back',
            cleaned_at: new Date().toISOString()
          })
          .eq('transaction_id', txError.data.transaction_id)
          .eq('status', 'started');
      }
      throw error;
    }
  },
  
  saveChats: async (chats: Chat[]) => {
    const transformedChats = chats.map(chat => ({
      id: chat.id,
      name: chat.name || '',
      model: chat.model || 'null',
      domination_field: chat.dominationField || 'Normal Chat',
      custom_prompt: chat.customPrompt || null,
      metadata: chat.metadata || {},
      updated_at: chat.updatedAt || new Date().toISOString()
    }));

    const { error } = await supabase
      .from('chats')
      .upsert(transformedChats, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (error) throw error;
    return { success: true };
  },
  
  // Message operations
  saveMessage: async (message: ChatMessage, transactionId?: string) => {
    try {
      // If transaction ID provided, verify it exists and is active
      if (transactionId) {
        const { data: txData, error: txError } = await supabase
          .from('stale_transactions')
          .select()
          .eq('transaction_id', transactionId)
          .eq('status', 'started')
          .single();

        if (txError || !txData) {
          throw new Error('Invalid or expired transaction');
        }
      }

      const { error } = await supabase
        .from('chat_history')
        .insert({
          chat_id: message.chatId,
          message_pair_id: message.messagePairId,
          user_content: message.userContent || '',
          assistant_content: message.assistantContent || '',
          user_role: message.userRole || 'user',
          assistant_role: message.assistantRole || 'assistant',
          domination_field: message.dominationField,
          model: message.model,
          custom_prompt: message.customPrompt,
          metadata: message.metadata || {}
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  },
  
  // Transaction operations
  beginTransaction: async (chatId: string) => {
    if (!chatId) {
      throw new Error('chat_id is required');
    }

    const { data, error } = await supabase
      .from('stale_transactions')
      .insert([{  // Note: Using array syntax for insert
        chat_id: chatId,
        status: 'started'
      }])
      .select('transaction_id')
      .single();
    
    if (error) {
      console.error('Transaction error:', error);
      throw new Error(`Failed to begin transaction: ${error.message}`);
    }
    
    return { data };
  },

  commitTransaction: async (transactionId: string) => {
    if (!transactionId) {
      throw new Error('transaction_id is required');
    }

    const { data, error } = await supabase
      .from('stale_transactions')
      .update({ 
        status: 'committed',
        cleaned_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId)
      .eq('status', 'started')
      .select()
      .single();
    
    if (error) {
      console.error('Commit error:', error);
      throw new Error(`Failed to commit transaction: ${error.message}`);
    }
    
    return data;
  },

  rollbackTransaction: async (transactionId: string) => {
    if (!transactionId) {
      throw new Error('transaction_id is required');
    }

    const { data, error } = await supabase
      .from('stale_transactions')
      .update({ 
        status: 'rolled_back',
        cleaned_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId)
      .eq('status', 'started')
      .select()
      .single();
    
    if (error) {
      console.error('Rollback error:', error);
      throw new Error(`Failed to rollback transaction: ${error.message}`);
    }
    
    return data;
  },
  
  // Fetch operations
  fetchChats: async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          model,
          domination_field,
          name,
          custom_prompt,
          metadata,
          created_at,
          updated_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match frontend types
      const transformedData = data?.map(chat => ({
        id: chat.id,
        userId: chat.user_id || '',
        name: chat.name || '',
        model: chat.model || 'null',
        dominationField: chat.domination_field || 'Normal Chat',
        customPrompt: chat.custom_prompt || null,
        metadata: chat.metadata || {},
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        messages: []
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching chats:', error);
      return { data: null, error };
    }
  },

  fetchChatHistory: async (chatId: string) => {
    return await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
  },
  
  // Delete operations
  deleteChat: async (chatId: string) => {
    const { error } = await supabase
      .from('chats')
      .delete()
      .match({ id: chatId });
    if (error) throw error;
  },

  // Add this new utility method
  handleTransaction: async (chatId: string, operation: () => Promise<void>) => {
    let transactionStarted = false;
    try {
      await supabase.rpc('begin_chat_transaction', { chat_id: chatId });
      transactionStarted = true;
      await operation();
      await supabase.rpc('commit_chat_transaction', { chat_id: chatId });
    } catch (error) {
      if (transactionStarted) {
        try {
          await supabase.rpc('rollback_chat_transaction', { chat_id: chatId });
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }
      throw new Error(error instanceof Error ? error.message : 'Transaction failed');
    }
  },

  updateChat: async (chatId: string, updates: ChatUpdate) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({
          name: updates.name,
          updated_at: new Date().toISOString(),
          // Only include other fields if they exist in updates
          ...(updates.model && { model: updates.model }),
          ...(updates.dominationField && { domination_field: updates.dominationField }),
          ...(updates.customPrompt && { custom_prompt: updates.customPrompt }),
          ...(updates.metadata && { metadata: updates.metadata })
        })
        .eq('id', chatId);

      if (error) throw error;
      
      // Fetch the updated chat
      const { data: chat, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();
        
      if (fetchError) throw fetchError;
      
      return { data: chat, error: null };
    } catch (error) {
      console.error('Error updating chat:', error);
      return { data: null, error };
    }
  },

  updateChatHistoryPrompt: async (chatId: string, customPrompt: string) => {
    const { error } = await supabase
      .from('chat_history')
      .update({ custom_prompt: customPrompt })
      .eq('chat_id', chatId);

    if (error) throw error;
    return { success: true };
  }
};
