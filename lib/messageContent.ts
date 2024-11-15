import { retryWithBackoff } from '@/actions/ai/utils/retry';
import { supabase } from '@/lib/supabase';

const CHUNK_SIZE = 4000; // Size in characters for each chunk

export interface MessageContentChunk {
  content: string;
  chunk_order: number;
}

export class MessageContentManager {
  static onProgress?: (progress: number) => void;

  static async storeContent(
    messageId: string, 
    content: string, 
    contentType: 'user' | 'assistant'
  ): Promise<void> {
    // Add chunking with progress tracking
    const chunks: string[] = [];
    let processedLength = 0;
    
    for (let i = 0; i < content.length; i += CHUNK_SIZE) {
      chunks.push(content.slice(i, i + CHUNK_SIZE));
      processedLength += CHUNK_SIZE;
      
      // Emit progress if needed
      if (this.onProgress) {
        this.onProgress(Math.min(100, (processedLength / content.length) * 100));
      }
    }

    // Store chunks in parallel with rate limiting
    const chunkPromises = chunks.map((chunk, index) => 
      this.storeChunk(messageId, chunk, index, contentType)
    );

    await Promise.all(chunkPromises);
  }

  private static async storeChunk(
    messageId: string,
    chunk: string,
    index: number,
    contentType: 'user' | 'assistant'
  ): Promise<void> {
    return retryWithBackoff(async () => {
      const { error } = await supabase
        .from('message_content')
        .insert({
          message_id: messageId,
          content_type: contentType,
          content_chunk: chunk,
          chunk_order: index
        });

      if (error) throw error;
    }, 3);
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