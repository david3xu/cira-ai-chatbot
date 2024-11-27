CREATE OR REPLACE FUNCTION verify_database_setup()
RETURNS BOOLEAN AS $$
DECLARE
    all_good BOOLEAN := true;
    missing_items TEXT := '';
BEGIN
    -- Verify extensions
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        missing_items := missing_items || 'vector extension, ';
        all_good := false;
    END IF;

    -- Verify tables
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chat_history') THEN
        missing_items := missing_items || 'chat_history table, ';
        all_good := false;
    END IF;

    -- Verify functions
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'store_chat_message') THEN
        missing_items := missing_items || 'store_chat_message function, ';
        all_good := false;
    END IF;

    -- Verify indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_chat_history_chat_id') THEN
        missing_items := missing_items || 'chat_history_chat_id index, ';
        all_good := false;
    END IF;

    IF NOT all_good THEN
        RAISE WARNING 'Missing components: %', missing_items;
    END IF;

    RETURN all_good;
END;
$$ LANGUAGE plpgsql; 