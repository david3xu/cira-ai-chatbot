-- Fix inconsistencies in database schema
DO $$ 
BEGIN
    -- Add updated_at to chats if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chats' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE chats 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- Add trigger for updated_at on chats if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'update_chats_updated_at'
    ) THEN
        CREATE TRIGGER update_chats_updated_at
            BEFORE UPDATE ON chats
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_history_chat_id_fkey'
    ) THEN
        ALTER TABLE chat_history
        ADD CONSTRAINT chat_history_chat_id_fkey
        FOREIGN KEY (chat_id) 
        REFERENCES chats(id) 
        ON DELETE CASCADE;
    END IF;

    -- Update all existing chats.updated_at to match their latest chat_history entry
    UPDATE chats c
    SET updated_at = COALESCE(
        (
            SELECT MAX(updated_at)
            FROM chat_history ch
            WHERE ch.chat_id = c.id
        ),
        c.created_at
    )
    WHERE c.updated_at IS NULL;

    -- Verify the changes
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chats' 
        AND column_name = 'updated_at'
    ) THEN
        RAISE EXCEPTION 'Failed to add updated_at column to chats table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_history_chat_id_fkey'
    ) THEN
        RAISE EXCEPTION 'Failed to add foreign key constraint to chat_history';
    END IF;

END $$;

-- Add helpful indexes if they don't exist
DO $$
BEGIN
    -- Index for chats.updated_at
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'ix_chats_updated_at'
    ) THEN
        CREATE INDEX ix_chats_updated_at ON chats(updated_at);
    END IF;

    -- Composite index for common query patterns
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'ix_chats_user_updated'
    ) THEN
        CREATE INDEX ix_chats_user_updated ON chats(user_id, updated_at DESC);
    END IF;
END $$;

-- Add comments to document the changes
COMMENT ON COLUMN chats.updated_at IS 'Last update timestamp for the chat, automatically managed by trigger';
COMMENT ON CONSTRAINT chat_history_chat_id_fkey ON chat_history IS 'Ensures referential integrity and cascading deletes for chat messages'; 