-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default user
INSERT INTO users (id)
SELECT '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (SELECT 1 FROM users); 