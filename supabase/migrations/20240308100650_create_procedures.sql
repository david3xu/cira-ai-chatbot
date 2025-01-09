-- Create stored procedures for atomic message operations

-- 1. Create message pair procedure
CREATE OR REPLACE FUNCTION create_message_pair(
  p_message_pair_id UUID,
  p_content TEXT,
  p_model TEXT,
  p_chat_id UUID,
  p_domination_field TEXT DEFAULT 'general',
  p_custom_prompt TEXT DEFAULT NULL,
  p_chat_topic TEXT DEFAULT NULL
) RETURNS SETOF chat_history
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result RECORD;
BEGIN
  -- Set default user ID if not in authenticated context
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID);

  -- Validate inputs
  IF p_content IS NULL OR LENGTH(TRIM(p_content)) = 0 THEN
    RAISE EXCEPTION 'Content cannot be empty';
  END IF;

  -- Insert user message with explicit error handling
  BEGIN
    INSERT INTO chat_history (
      message_pair_id,
      chat_id,
      user_id,
      user_content,
      user_role,
      assistant_role,
      status,
      model,
      domination_field,
      custom_prompt,
      chat_topic
    ) VALUES (
      p_message_pair_id,
      p_chat_id,
      v_user_id,
      p_content,
      'user',
      'assistant',
      'sending',
      p_model,
      p_domination_field,
      p_custom_prompt,
      p_chat_topic
    )
    RETURNING * INTO v_result;
  
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Message pair ID already exists: %', p_message_pair_id;
    WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'Invalid chat ID or user ID';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error creating message pair: %', SQLERRM;
  END;

  -- Return the created message pair
  RETURN QUERY
  SELECT * FROM chat_history
  WHERE message_pair_id = p_message_pair_id
  ORDER BY created_at ASC;
END;
$$;

-- 2. Update message pair status
CREATE OR REPLACE FUNCTION update_message_pair_status(
  p_message_pair_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
) RETURNS SETOF chat_history
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all messages in the pair
  UPDATE chat_history
  SET 
    status = p_status,
    metadata = CASE 
      WHEN p_error_message IS NOT NULL 
      THEN jsonb_build_object('error', p_error_message)
      ELSE metadata
    END,
    updated_at = now()
  WHERE message_pair_id = p_message_pair_id;

  -- Return updated messages
  RETURN QUERY
  SELECT * FROM chat_history
  WHERE message_pair_id = p_message_pair_id
  ORDER BY created_at ASC;
END;
$$;

-- 3. Complete message pair
CREATE OR REPLACE FUNCTION complete_message_pair(
  p_message_pair_id UUID,
  p_assistant_content TEXT,
  p_metadata JSONB DEFAULT NULL
) RETURNS SETOF chat_history
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update assistant message with content
  UPDATE chat_history
  SET 
    assistant_content = p_assistant_content,
    status = 'success',
    metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb),
    updated_at = now()
  WHERE 
    message_pair_id = p_message_pair_id
    AND assistant_role = 'assistant';

  -- Return updated messages
  RETURN QUERY
  SELECT * FROM chat_history
  WHERE message_pair_id = p_message_pair_id
  ORDER BY created_at ASC;
END;
$$;

-- 4. Cancel message pair
CREATE OR REPLACE FUNCTION cancel_message_pair(
  p_message_pair_id UUID,
  p_reason TEXT DEFAULT NULL
) RETURNS SETOF chat_history
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all messages in the pair
  UPDATE chat_history
  SET 
    status = 'cancelled',
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'cancelled_at', now(),
      'cancel_reason', p_reason
    ),
    updated_at = now()
  WHERE message_pair_id = p_message_pair_id;

  -- Return updated messages
  RETURN QUERY
  SELECT * FROM chat_history
  WHERE message_pair_id = p_message_pair_id
  ORDER BY created_at ASC;
END;
$$;

-- Add function comments (moved to end)
COMMENT ON FUNCTION create_message_pair IS 'Creates a new message pair with user content and assistant placeholder';
COMMENT ON FUNCTION update_message_pair_status IS 'Updates the status of all messages in a pair';
COMMENT ON FUNCTION complete_message_pair IS 'Completes a message pair with assistant response';
COMMENT ON FUNCTION cancel_message_pair IS 'Cancels a message pair and records the reason';
  