import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function createNewChatInDB(chatId: string, dominationField: string) {
  try {
    const { error } = await supabase
      .from('chat_history')
      .insert({
        chat_id: chatId,
        domination_field: dominationField,
        message_pair_id: uuidv4(),
        user_content: '',
        user_role: 'system',
        assistant_content: 'Chat initialized',
        assistant_role: 'system'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating new chat in DB:', error);
    throw error;
  }
}
