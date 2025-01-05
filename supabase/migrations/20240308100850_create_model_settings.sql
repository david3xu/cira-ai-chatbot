-- Create model settings table
CREATE TABLE model_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER,
  top_p FLOAT DEFAULT 1.0,
  frequency_penalty FLOAT DEFAULT 0.0,
  presence_penalty FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, model)
);

-- Indexes
CREATE INDEX idx_model_settings_user_id ON model_settings(user_id);

-- Enable RLS
ALTER TABLE model_settings ENABLE ROW LEVEL SECURITY;

-- Model settings policies
CREATE POLICY "Users can view their own model settings"
  ON model_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own model settings"
  ON model_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_model_settings_updated_at
    BEFORE UPDATE ON model_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 