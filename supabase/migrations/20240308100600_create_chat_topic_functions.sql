-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "plpgsql";

-- Function to apply changes safely
CREATE OR REPLACE FUNCTION apply_chat_topic_changes()
RETURNS void AS $$
BEGIN
    -- Drop existing objects if they exist
    DROP TRIGGER IF EXISTS chat_topic_trigger ON chat_history;
    DROP FUNCTION IF EXISTS update_chat_topic();
    DROP FUNCTION IF EXISTS generate_chat_topic(TEXT, TEXT);
    
    -- Create generate_chat_topic function
    CREATE OR REPLACE FUNCTION generate_chat_topic(
        user_msg TEXT,
        assistant_msg TEXT
    ) RETURNS TEXT
    LANGUAGE plpgsql
    AS $func$
    DECLARE
        combined_text TEXT;
        topic TEXT;
    BEGIN
        -- Handle null inputs
        IF user_msg IS NULL AND assistant_msg IS NULL THEN
            RETURN NULL;
        END IF;
        
        combined_text := COALESCE(LEFT(user_msg, 100), '') || ' ' || COALESCE(LEFT(assistant_msg, 100), '');
        
        -- Improved topic extraction
        topic := CASE
            WHEN combined_text ~ '^[^.!?]+[.!?]' THEN
                SUBSTRING(combined_text FROM '^[^.!?]+[.!?]')
            WHEN LENGTH(combined_text) > 50 THEN
                LEFT(combined_text, 50) || '...'
            ELSE
                combined_text
        END;
        
        RETURN NULLIF(TRIM(topic), '');
    END;
    $func$;

    -- Create update_chat_topic trigger function
    CREATE OR REPLACE FUNCTION update_chat_topic()
    RETURNS TRIGGER AS $func$
    BEGIN
        -- Generate topic for new message pairs
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.assistant_content IS NOT NULL) THEN
            NEW.chat_topic := generate_chat_topic(NEW.user_content, NEW.assistant_content);
        END IF;
        
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    -- Create new trigger
    CREATE TRIGGER chat_topic_trigger
        BEFORE INSERT OR UPDATE OF user_content, assistant_content ON chat_history
        FOR EACH ROW
        EXECUTE FUNCTION update_chat_topic();

    -- Update existing records
    UPDATE chat_history
    SET chat_topic = generate_chat_topic(user_content, assistant_content)
    WHERE chat_topic IS NULL
    AND (user_content IS NOT NULL OR assistant_content IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- Create an apply button function
CREATE OR REPLACE FUNCTION apply_chat_topic_updates()
RETURNS TEXT AS $$
BEGIN
    -- Execute the changes
    PERFORM apply_chat_topic_changes();
    
    -- Return success message
    RETURN 'Chat topic functions and trigger updated successfully';
EXCEPTION
    WHEN OTHERS THEN
        -- Return error message if something goes wrong
        RETURN 'Error updating chat topic functions: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Comment out the direct execution for safety
-- SELECT apply_chat_topic_changes();