-- First, ensure we're in the public schema
SET search_path TO public;

-- Create the stale_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stale_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id UUID NOT NULL DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'started',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cleaned_at TIMESTAMPTZ,
    UNIQUE(transaction_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stale_transactions_chat_id ON public.stale_transactions(chat_id);
CREATE INDEX IF NOT EXISTS idx_stale_transactions_status ON public.stale_transactions(status);

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.stale_transactions TO authenticated;
GRANT USAGE ON SEQUENCE public.stale_transactions_id_seq TO authenticated;

-- Add RLS policy for stale_transactions
ALTER TABLE public.stale_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON public.stale_transactions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

