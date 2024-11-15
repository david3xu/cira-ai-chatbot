import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/lib/chat';
import { v4 as uuidv4 } from 'uuid';
import { validate as isUUID } from 'uuid';

interface MessageData {
  id: string;
  user_id: string;
  created_at: string;
  domination_field: string;
  chat_id: string;
  message_pair_id: string;
  user_content?: string;
  assistant_content?: string;
  user_role?: 'user' | 'system';
  assistant_role?: 'assistant' | 'system';
  chat_topic?: string;
  image_url?: string;
  model?: string;
  metadata?: any;
}

export async function fetchChatHistory(chatId: string): Promise<ChatMessage[]> {
  console.log(`[fetchHistory] Starting fetch for chat: ${chatId}`);
  
  try {
    if (!chatId || !isUUID(chatId)) {
      console.warn('[fetchHistory] Invalid chat ID provided:', chatId);
      return [];
    }
    
    // First verify chat exists
    const { data: chatExists, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .single();

    if (chatError) {
      console.error('[fetchHistory] Error checking chat:', chatError);
      return [];
    }

    if (!chatExists) {
      console.warn('[fetchHistory] Chat not found:', chatId);
      return [];
    }

    // Then fetch messages
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[fetchHistory] Error fetching messages:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('[fetchHistory] No messages found for chat:', chatId);
      return [];
    }

    console.log(`[fetchHistory] Found ${data.length} messages for chat:`, chatId);
    
    const messages: ChatMessage[] = [];
    data.forEach((record: MessageData) => {
      if (record.user_content) {
        messages.push({
          id: record.id,
          role: 'user',
          content: record.user_content,
          dominationField: record.domination_field,
          image: record.image_url,
          chat_topic: record.chat_topic,
          model: record.model,
          created_at: record.created_at
        });
      }
      
      if (record.assistant_content) {
        messages.push({
          id: uuidv4(),
          role: 'assistant',
          content: record.assistant_content,
          dominationField: record.domination_field,
          chat_topic: record.chat_topic,
          model: record.model,
          created_at: record.created_at
        });
      }
    });

    console.log(`[fetchHistory] Processed ${messages.length} messages for chat:`, chatId);
    return messages;
  } catch (error) {
    console.error('[fetchHistory] Unexpected error:', error);
    throw error;
  }
}
