CREATE TABLE IF NOT EXISTS message_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_history(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('user', 'assistant')),
    content_chunk TEXT NOT NULL,
    chunk_order INTEGER NOT NULL CHECK (chunk_order >= 0),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint for message chunks
ALTER TABLE message_content 
    ADD CONSTRAINT unique_message_chunk UNIQUE (message_id, chunk_order);

-- Indexes
CREATE INDEX IF NOT EXISTS ix_message_content_message_id 
    ON message_content(message_id);

CREATE INDEX IF NOT EXISTS ix_message_content_order 
    ON message_content(message_id, chunk_order);

-- Enable RLS
ALTER TABLE message_content ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Enable read access for all users" ON "public"."message_content"
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON "public"."message_content"
    FOR INSERT WITH CHECK (true); 