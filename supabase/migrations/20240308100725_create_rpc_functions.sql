-- Create chat RPC functions
CREATE OR REPLACE FUNCTION create_chat(
  p_user_id UUID,
  p_name TEXT,
  p_model TEXT,
  p_domination_field TEXT,
  p_custom_prompt TEXT
) RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chat chats;
BEGIN
  -- Insert new chat
  INSERT INTO chats (
    user_id,
    name,
    model,
    domination_field,
    custom_prompt,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    COALESCE(p_name, 'New Chat'),
    COALESCE(p_model, ''),
    COALESCE(p_domination_field, ''),
    p_custom_prompt,
    now(),
    now()
  )
  RETURNING * INTO v_chat;

  -- Return as JSON
  RETURN row_to_json(v_chat);
END;
$$;

-- Add function comment for PostgREST
COMMENT ON FUNCTION create_chat IS 'Creates a new chat with the specified parameters';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_chat TO authenticated;
GRANT EXECUTE ON FUNCTION create_chat TO service_role;

-- Add get_chat_messages function
CREATE OR REPLACE FUNCTION get_chat_messages(
  p_chat_id UUID
) RETURNS SETOF chat_history
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM chat_history
  WHERE chat_id = p_chat_id
  ORDER BY created_at ASC;
END;
$$;

-- Add function comment for PostgREST
COMMENT ON FUNCTION get_chat_messages IS 'Retrieves all messages for a specific chat';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_messages TO service_role; 