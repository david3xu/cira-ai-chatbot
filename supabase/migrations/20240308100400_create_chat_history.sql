-- Enable pg_trgm extension first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing table
DROP TABLE IF EXISTS chat_history;

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000000',
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    domination_field TEXT NOT NULL,
    message_pair_id UUID NOT NULL UNIQUE,
    user_content TEXT,
    assistant_content TEXT,
    user_role TEXT CHECK (user_role IN ('user', 'system')),
    assistant_role TEXT CHECK (assistant_role IN ('assistant', 'system')),
    chat_topic TEXT,
    image_url TEXT,
    model TEXT,
    custom_prompt TEXT,
    metadata JSONB
);

-- Add GiST index for content fields
CREATE INDEX IF NOT EXISTS ix_chat_history_content ON chat_history 
USING GIST (user_content gist_trgm_ops, assistant_content gist_trgm_ops);

-- Regular indexes (including new index for updated_at)
CREATE INDEX IF NOT EXISTS ix_chat_history_chat_id ON chat_history(chat_id);
CREATE INDEX IF NOT EXISTS ix_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS ix_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS ix_chat_history_updated_at ON chat_history(updated_at);
CREATE INDEX IF NOT EXISTS ix_chat_history_message_pair ON chat_history(message_pair_id);
CREATE INDEX IF NOT EXISTS ix_chat_history_chat_topic ON chat_history(chat_topic);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS ix_chat_history_chat_time ON chat_history(chat_id, created_at DESC);

-- Add new composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS ix_chat_history_user_message_time 
ON chat_history(user_id, message_pair_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_chat_history_domination_time 
ON chat_history(domination_field, created_at DESC);

-- Add partial index for non-null assistant_content
CREATE INDEX IF NOT EXISTS ix_chat_history_completed_messages 
ON chat_history(chat_id, created_at DESC) 
WHERE assistant_content IS NOT NULL;

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON "public"."chat_history"
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON "public"."chat_history"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON "public"."chat_history"
    FOR UPDATE USING (true) WITH CHECK (true);

-- Remove the restrictive model constraint
ALTER TABLE chat_history DROP CONSTRAINT IF EXISTS valid_model;

-- We can add a more general constraint if needed
ALTER TABLE chat_history 
ADD CONSTRAINT model_not_empty CHECK (
    model IS NULL OR 
    LENGTH(TRIM(model)) > 0
);

-- Consider adding index for domination_field
CREATE INDEX IF NOT EXISTS ix_chat_history_domination_field 
ON chat_history(domination_field);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_history_updated_at
    BEFORE UPDATE ON chat_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();