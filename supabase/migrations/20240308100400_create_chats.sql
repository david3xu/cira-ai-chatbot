-- Create chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000000',
  name TEXT,
  model TEXT,
  custom_prompt TEXT,
  domination_field TEXT NOT NULL DEFAULT 'General',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS ix_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS ix_chats_created_at ON chats(created_at);
CREATE INDEX IF NOT EXISTS ix_chats_domination_field ON chats(domination_field);
CREATE INDEX IF NOT EXISTS ix_chats_updated_at ON chats(updated_at);
CREATE INDEX IF NOT EXISTS ix_chats_user_updated ON chats(user_id, updated_at DESC);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON "public"."chats"
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON "public"."chats"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON "public"."chats"
    FOR UPDATE USING (true) WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 