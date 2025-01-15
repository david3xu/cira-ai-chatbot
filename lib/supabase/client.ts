import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/supabase/types/database.types';

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>();
  }
  return supabaseClient;
}; 