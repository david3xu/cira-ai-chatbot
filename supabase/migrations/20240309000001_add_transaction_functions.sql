-- Add this at the start of the file
DO $$ 
BEGIN
    -- Drop potentially conflicting functions first
    DROP FUNCTION IF EXISTS store_chat_message(JSONB, TEXT);
    DROP FUNCTION IF EXISTS begin_chat_transaction(UUID);
    DROP FUNCTION IF EXISTS commit_chat_transaction(UUID);
    DROP FUNCTION IF EXISTS rollback_chat_transaction(UUID);
END $$;

-- Begin transaction function
CREATE OR REPLACE FUNCTION begin_chat_transaction(chat_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  chat_record RECORD;
BEGIN
  -- Lock the chat record for update
  SELECT * INTO chat_record 
  FROM chats 
  WHERE id = chat_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Chat not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'chat_id', chat_id,
      'updated_at', chat_record.updated_at
    )
  );
END;
$function$;

-- Store message function
CREATE OR REPLACE FUNCTION store_chat_message(
  message_data JSONB,
  operation TEXT DEFAULT 'insert'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_chat_id UUID := (message_data->>'chat_id')::UUID;
  v_message_id UUID := COALESCE((message_data->>'id')::UUID, gen_random_uuid());
  v_message_pair_id UUID := (message_data->>'message_pair_id')::UUID;
  result JSONB;
BEGIN
  -- Verify chat exists and is locked
  IF NOT EXISTS (
    SELECT 1 FROM chats 
    WHERE id = v_chat_id 
    FOR UPDATE
  ) THEN
    RAISE EXCEPTION 'Chat not found or not locked';
  END IF;

  IF operation = 'insert' THEN
    INSERT INTO chat_history (
      id,
      chat_id,
      message_pair_id,
      user_content,
      assistant_content,
      user_role,
      assistant_role,
      domination_field,
      model,
      custom_prompt,
      metadata,
      created_at,
      updated_at
    )
    VALUES (
      v_message_id,
      v_chat_id,
      v_message_pair_id,
      message_data->>'user_content',
      '',
      COALESCE(message_data->>'user_role', 'user'),
      COALESCE(message_data->>'assistant_role', 'assistant'),
      message_data->>'domination_field',
      message_data->>'model',
      message_data->>'custom_prompt',
      CASE 
        WHEN message_data->>'files' IS NOT NULL 
        THEN jsonb_build_object('files', message_data->'files')
        ELSE NULL 
      END,
      NOW(),
      NOW()
    )
    RETURNING to_jsonb(chat_history.*) INTO result;

    -- Update chat's last activity
    UPDATE chats 
    SET updated_at = NOW()
    WHERE id = v_chat_id;

  ELSIF operation = 'update' THEN
    UPDATE chat_history
    SET 
      assistant_content = message_data->>'assistant_content',
      updated_at = NOW()
    WHERE 
      chat_id = v_chat_id
      AND message_pair_id = v_message_pair_id
    RETURNING to_jsonb(chat_history.*) INTO result;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', result
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;

-- Commit transaction function
CREATE OR REPLACE FUNCTION commit_chat_transaction(chat_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Transaction will be automatically committed
  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object('chat_id', chat_id)
  );
END;
$function$;

-- Rollback transaction function
CREATE OR REPLACE FUNCTION rollback_chat_transaction(chat_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Explicitly rollback the transaction
  ROLLBACK;
  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object('chat_id', chat_id)
  );
END;
$function$; 