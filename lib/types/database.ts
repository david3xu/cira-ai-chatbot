// lib/types/database.ts
// These types match your Supabase/database tables directly
import { ChatRow, MessageRow as SupabaseMessageRow, DocumentRow } from './supabase'

// Now these types are derived from your actual DB schema
export type DBChat = ChatTableRow
export type DBMessage = SupabaseMessageRow
export type DBDocument = DocumentRow

// Add any additional types not covered by the schema
export interface DBChatExtended extends DBChat {
  messages?: DBMessage[]
}

// These match exactly with your SQL tables
export interface ChatTableRow {
  id: string;
  user_id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  model: string | null;
  domination_field: string;
  custom_prompt?: string;
  metadata?: Record<string, any>;
}

export interface ChatMessageTableRow {
  id: string;
  chat_id: string;
  message_pair_id: string;
  user_content: string | null;
  assistant_content: string | null;
  user_role: 'user' | 'system';
  assistant_role: 'assistant' | 'system';
  created_at: string;
  updated_at: string;
  domination_field: string;
  model: string;
  image_url?: string;
  metadata?: Record<string, any>;
  custom_prompt?: string;
  status: 'sending' | 'streaming' | 'success' | 'failed';
}

export interface MessageRow {
  id: string;
  content: string;
  assistant_content: string | null;
  status: 'sending' | 'streaming' | 'success' | 'failed';
  created_at: string;
  updated_at: string;
  chat_id: string;
  role: 'user' | 'assistant';
  model: string;
  metadata?: Record<string, any>;
}
