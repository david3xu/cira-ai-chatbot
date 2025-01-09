import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/supabase/types/database.types';

// Singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | undefined;
let componentClientInstance: ReturnType<typeof createClientComponentClient<Database>> | undefined;

// Server-side client
export const supabase = (() => {
  if (!supabaseInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    supabaseInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  return supabaseInstance;
})();

// Client-side component client
export const createComponentClient = () => {
  if (!componentClientInstance) {
    componentClientInstance = createClientComponentClient<Database>();
  }
  return componentClientInstance;
};

// Storage client helper
export const storage = supabase.storage;

export default supabase; 