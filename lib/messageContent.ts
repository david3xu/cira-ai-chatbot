import { supabase } from '@/lib/supabase';

const CHUNK_SIZE = 4000; // Size in characters for each chunk

export interface MessageContentChunk {
  content: string;
  chunk_order: number;
}

export class MessageContentManager {
  static async storeContent(
    messageId: string, 
    content: string, 
    contentType: 'user' | 'assistant'
  ): Promise<void> {
    // Split content into chunks
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += CHUNK_SIZE) {
      chunks.push(content.slice(i, i + CHUNK_SIZE));
    }

    // Store each chunk
    const chunkInserts = chunks.map((chunk, index) => ({
      message_id: messageId,
      content_type: contentType,
      content_chunk: chunk,
      chunk_order: index
    }));

    const { error } = await supabase
      .from('message_content')
      .insert(chunkInserts);

    if (error) throw error;
  }

  static async retrieveContent(
    messageId: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('message_content')
      .select('content_chunk, chunk_order')
      .eq('message_id', messageId)
      .order('chunk_order');

    if (error) throw error;
    
    return data
      .sort((a, b) => a.chunk_order - b.chunk_order)
      .map(chunk => chunk.content_chunk)
      .join('');
  }
} 