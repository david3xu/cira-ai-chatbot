CREATE OR REPLACE FUNCTION verify_table_dependencies()
RETURNS BOOLEAN AS $$
DECLARE
    dependencies_met BOOLEAN := true;
    missing_items TEXT := '';
BEGIN
    -- Verify tables exist in correct order
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
        missing_items := missing_items || 'users table, ';
        dependencies_met := false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chats') THEN
        missing_items := missing_items || 'chats table, ';
        dependencies_met := false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chat_history') THEN
        missing_items := missing_items || 'chat_history table, ';
        dependencies_met := false;
    END IF;

    -- Verify foreign key constraints
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_history_chat_id_fkey'
    ) THEN
        missing_items := missing_items || 'chat_history_chat_id foreign key, ';
        dependencies_met := false;
    END IF;

    IF NOT dependencies_met THEN
        RAISE WARNING 'Missing dependencies: %', missing_items;
    END IF;

    RETURN dependencies_met;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT verify_table_dependencies(); 