-- Create stale_transactions table for transaction monitoring
CREATE TABLE IF NOT EXISTS stale_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cleaned_at TIMESTAMP WITH TIME ZONE,
    status TEXT
);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS ix_stale_transactions_status 
    ON stale_transactions(status);

-- Enable RLS
ALTER TABLE stale_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON "public"."stale_transactions"
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON "public"."stale_transactions"
    FOR INSERT WITH CHECK (true);