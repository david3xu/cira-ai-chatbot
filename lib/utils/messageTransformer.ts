import type { ChatMessage } from '@/lib/types/chat';
import type { Database } from '@/supabase/types/database.types';

export const transformDatabaseMessage = (
  msg: Database['public']['Tables']['chat_history']['Row']
): ChatMessage => ({
  id: msg.id,
  chatId: msg.chat_id || '',
  messagePairId: msg.message_pair_id,
  createdAt: msg.created_at || new Date().toISOString(),
  updatedAt: msg.updated_at || new Date().toISOString(),
  userContent: msg.user_content || '',
  userRole: msg.user_role as 'user' | 'system',
  assistantContent: msg.assistant_content || '',
  assistantRole: msg.assistant_role as 'assistant' | 'system',
  dominationField: msg.domination_field || '',
  model: msg.model || '',
  status: msg.status as 'sending' | 'success' | 'failed',
  customPrompt: msg.custom_prompt === null ? undefined : msg.custom_prompt,
  metadata: msg.metadata as Record<string, any> || {}
});

export const transformMessageToDatabase = (
  msg: ChatMessage
): Partial<Database['public']['Tables']['chat_history']['Row']> => ({
  id: msg.id,
  chat_id: msg.chatId,
  message_pair_id: msg.messagePairId,
  user_content: msg.userContent,
  user_role: msg.userRole,
  assistant_content: msg.assistantContent,
  assistant_role: msg.assistantRole,
  domination_field: msg.dominationField,
  model: msg.model,
  status: msg.status,
  custom_prompt: msg.customPrompt || null,
  metadata: msg.metadata || null
}); 