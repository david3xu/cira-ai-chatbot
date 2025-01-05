import { createClient } from '@supabase/supabase-js'
import { Database } from '@/supabase/types/database.types'

export class StorageClient {
  private client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  get storage() {
    return this.client.storage;
  }
} 