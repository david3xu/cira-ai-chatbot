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
  try {
    if (!chatId || !isUUID(chatId)) {
      console.warn('Invalid chat ID provided:', chatId);
      return [];
    }
    
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('No chat history found for chatId:', chatId);
      return [];
    }

    // Transform each record into a ChatMessage
    const messages = data.map((record: MessageData) => {
      // If record has user_content, it's a user message
      if (record.user_content) {
        return {
          id: record.id,
          role: 'user',
          content: record.user_content,
          dominationField: record.domination_field,
          image: record.image_url,
          chat_topic: record.chat_topic,
          model: record.model
        };
      }
      // If record has assistant_content, it's an assistant message
      if (record.assistant_content) {
        return {
          id: record.id,
          role: 'assistant',
          content: record.assistant_content,
          dominationField: record.domination_field,
          chat_topic: record.chat_topic,
          model: record.model
        };
      }
      // Skip any malformed records
      return null;
    })
    .filter(Boolean) as ChatMessage[];

    return messages;
  } catch (error) {
    console.error('Error in fetchChatHistory:', error);
    throw error;
  }
}
