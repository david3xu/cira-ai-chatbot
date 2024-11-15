import { supabase } from "./supabase";

export async function verifyMessageStorage(chatId: string) {
  console.log('=== Verifying Message Storage ===');
  
  try {
    // Check chat exists
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
    
    if (chatError) {
      console.error('Error fetching chat:', chatError);
      return false;
    }
    
    console.log('Chat found:', chat);

    // Check messages exist
    const { data: messages, error: msgError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_id', chatId);
    
    if (msgError) {
      console.error('Error fetching messages:', msgError);
      return false;
    }
    
    console.log('Messages found:', messages?.length);
    
    return {
      chatExists: !!chat,
      messageCount: messages?.length || 0,
      chat,
      messages
    };
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
} 