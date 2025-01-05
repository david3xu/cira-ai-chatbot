import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/supabase/types/database.types'

export const createClient = () => {
  const supabase = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  return supabase
} 