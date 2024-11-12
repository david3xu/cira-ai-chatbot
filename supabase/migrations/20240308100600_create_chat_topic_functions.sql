-- Create function to generate chat topic
CREATE OR REPLACE FUNCTION generate_chat_topic(
    user_msg TEXT,
    assistant_msg TEXT
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    combined_text TEXT;
    topic TEXT;
BEGIN
    combined_text := COALESCE(LEFT(user_msg, 100), '') || ' ' || COALESCE(LEFT(assistant_msg, 100), '');
    
    topic := COALESCE(
        SUBSTRING(combined_text FROM '^[^.!?]+[.!?]'),
        LEFT(combined_text, 50)
    );
    
    RETURN topic;
END;
$$;

-- Create update chat topic function
CREATE OR REPLACE FUNCTION update_chat_topic()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM chat_history 
        WHERE chat_id = NEW.chat_id 
        AND id != NEW.id
    ) THEN
        NEW.chat_topic := generate_chat_topic(NEW.user_content, NEW.assistant_content);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER chat_topic_trigger
    BEFORE INSERT OR UPDATE ON chat_history
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_topic();