export interface MessageChunk {
  id?: string;
  message_id: string;
  content_type: 'user' | 'assistant';
  content_chunk: string;
  chunk_order: number;
  created_at?: string;
}

export interface ChunkedMessage {
  content_chunks?: MessageChunk[];
  has_chunks?: boolean;
} 