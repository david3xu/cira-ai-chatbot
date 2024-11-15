import { Chat } from '@/lib/chat';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

interface CreateChatParams {
  chatId: string;
  customPrompt?: string;
  model?: string;
  dominationField?: string;
}

let lastInitTime = 0;
const INIT_COOLDOWN = 2000; // 2 seconds

export async function createNewChat({ 
  chatId,
  customPrompt = '', 
  model = process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'llama3.1',
  dominationField = 'Normal Chat'
}: CreateChatParams): Promise<Chat> {
  const now = Date.now();
  if (now - lastInitTime < INIT_COOLDOWN) {
    throw new Error('Please wait before creating another chat');
  }
  
  lastInitTime = now;

  try {
    const newChat: Chat = {
      id: chatId,
      name: 'New Chat',
      messages: [],
      model: model,
      customPrompt: customPrompt,
      historyLoaded: false,
      dominationField: dominationField
    };

    const { data, error } = await supabase
      .from('chats')
      .insert({
        id: newChat.id,
        name: newChat.name,
        model: newChat.model,
        custom_prompt: newChat.customPrompt,
        domination_field: newChat.dominationField
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat in database:', error);
      throw new Error('Failed to create chat in database');
    }

    return newChat;
  } catch (error) {
    console.error('Error in createNewChat:', error);
    throw error;
  }
}
