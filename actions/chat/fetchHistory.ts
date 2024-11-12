import { supabase } from '@/lib/supabase';
import { ChatMessage, MessageData } from '@/lib/chat';
import { v4 as uuidv4 } from 'uuid';

export async function fetchChatHistory(chatId: string): Promise<ChatMessage[]> {
  try {
    if (!chatId || chatId.trim() === '') {
      console.warn('Empty chat ID provided');
      return [];
    }
    
    console.log('Fetching chat history for chatId:', chatId);
    
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    if (!data) {
      console.log('No data returned from Supabase');
      return [];
    }

    const messages = data.map((item: MessageData) => {
      let role: 'user' | 'assistant' | 'system';
      if (item.user_role === 'user') {
        role = 'user';
      } else if (item.assistant_role === 'assistant') {
        role = 'assistant';
      } else {
        role = 'system';
      }

      const content = role === 'user' 
        ? item.user_content || ''
        : role === 'assistant'
          ? item.assistant_content || ''
          : '';

      return {
        id: uuidv4(),
        role,
        content,
        dominationField: item.domination_field,
        image: item.image_url,
        chat_topic: item.chat_topic
      };
    });

    console.log('Processed messages:', messages);
    return messages;

  } catch (error) {
    console.error('Error in fetchChatHistory:', error);
    if (error instanceof Error && error.message.includes('406')) {
      console.error('406 Not Acceptable error - Check content negotiation headers');
    }
    throw error;
  }
}
