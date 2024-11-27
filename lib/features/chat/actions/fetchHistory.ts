import { supabaseAdmin } from '@/lib/supabase/client';
import { ChatMessage } from '@/lib/types/chat/chat';
import { MessageChunk } from '@/lib/types/chat/messageContent';

export async function fetchChatHistory(chatId: string): Promise<ChatMessage[]> {
  try {
    // Fetch messages with their chunks
    const { data: messages, error } = await supabaseAdmin
      .from('chat_history')
      .select(`
        *,
        message_content (
          id,
          content_type,
          content_chunk,
          chunk_order
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    // Process messages and their chunks
    return (messages || []).map(message => {
      const processedMessage = { ...message } as any;
      
      if (message.message_content?.length > 0) {
        processedMessage.content_chunks = message.message_content
          .sort((a: MessageChunk, b: MessageChunk) => a.chunk_order - b.chunk_order);
        delete processedMessage.message_content;
      }
      
      return processedMessage as ChatMessage;
    });
  } catch (error) {
    console.error('Error in fetchChatHistory:', error);
    throw error;
  }
} 