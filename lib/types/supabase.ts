import { Database } from '@/supabase/types/database.types'

// Export convenience types
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Table row types
export type ChatRow = Tables['chats']['Row']
export type MessageRow = Tables['chat_history']['Row']
export type DocumentRow = Tables['documents']['Row']

// Insert types
export type ChatInsert = Tables['chats']['Insert']
export type MessageInsert = Tables['chat_history']['Insert']
export type DocumentInsert = Tables['documents']['Insert']

// Update types
export type ChatUpdate = Tables['chats']['Update']
export type MessageUpdate = Tables['chat_history']['Update']
export type DocumentUpdate = Tables['documents']['Update'] 