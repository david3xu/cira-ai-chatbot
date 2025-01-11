-- Create chat_history table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000000',
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  domination_field TEXT NOT NULL,
  message_pair_id UUID NOT NULL,
  user_content TEXT,
  assistant_content TEXT,
  user_role TEXT CHECK (user_role IN ('user', 'system')),
  assistant_role TEXT CHECK (assistant_role IN ('assistant', 'system')),
  chat_topic TEXT,
  image_url TEXT,
  model TEXT,
  custom_prompt TEXT,
  metadata JSONB,
  status TEXT CHECK (status IN ('sending', 'success', 'failed', 'cancelled')) DEFAULT 'sending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_message_pair_user UNIQUE (message_pair_id, user_role),
  CONSTRAINT unique_message_pair_assistant UNIQUE (message_pair_id, assistant_role)
);

-- Add foreign key constraint
ALTER TABLE chat_history
ADD CONSTRAINT fk_chat_id
FOREIGN KEY (chat_id)
REFERENCES chats(id)
ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS ix_chat_history_chat_id ON chat_history(chat_id);
CREATE INDEX IF NOT EXISTS ix_chat_history_message_pair ON chat_history(message_pair_id);
CREATE INDEX IF NOT EXISTS ix_chat_history_chat_created ON chat_history(chat_id, created_at DESC);

-- Indexes
CREATE INDEX IF NOT EXISTS ix_chat_history_content ON chat_history 
USING GIST (user_content gist_trgm_ops, assistant_content gist_trgm_ops);
CREATE INDEX IF NOT EXISTS ix_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS ix_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS ix_chat_history_chat_topic ON chat_history(chat_topic);
CREATE INDEX IF NOT EXISTS ix_chat_history_status ON chat_history(status);
CREATE INDEX IF NOT EXISTS ix_chat_history_domination_field ON chat_history(domination_field);
CREATE INDEX IF NOT EXISTS ix_chat_history_chat_time ON chat_history(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_chat_history_user_message_time ON chat_history(user_id, message_pair_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_chat_history_domination_time ON chat_history(domination_field, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_chat_history_completed_messages ON chat_history(chat_id, created_at DESC) 
WHERE assistant_content IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_chat_history_cancelled ON chat_history(chat_id, status) 
WHERE status = 'cancelled';

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON "public"."chat_history"
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON "public"."chat_history"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON "public"."chat_history"
    FOR UPDATE USING (true) WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_chat_history_updated_at
    BEFORE UPDATE ON chat_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add model constraint
ALTER TABLE chat_history 
ADD CONSTRAINT model_not_empty CHECK (
    model IS NULL OR 
    LENGTH(TRIM(model)) > 0
); 