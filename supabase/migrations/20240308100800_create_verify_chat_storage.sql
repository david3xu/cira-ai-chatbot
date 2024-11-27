CREATE OR REPLACE FUNCTION public.verify_chat_storage(p_chat_id UUID)
RETURNS JSON AS $$
DECLARE
    chat_exists BOOLEAN;
    message_count INTEGER;
    result JSON;
BEGIN
    -- Check if chat exists
    SELECT EXISTS (
        SELECT 1 FROM public.chats WHERE id = p_chat_id
    ) INTO chat_exists;

    -- Get message count if chat exists
    IF chat_exists THEN
        SELECT COUNT(*) 
        FROM public.chat_history 
        WHERE chat_id = p_chat_id 
        INTO message_count;
    ELSE
        message_count := 0;
    END IF;

    -- Construct result JSON
    result := json_build_object(
        'success', chat_exists,
        'chatExists', chat_exists,
        'messageCount', message_count
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comment
COMMENT ON FUNCTION public.verify_chat_storage(UUID) IS 'Verifies existence of chat and returns message count';
