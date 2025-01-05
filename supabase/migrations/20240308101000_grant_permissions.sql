-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_message_pair TO anon;
GRANT EXECUTE ON FUNCTION create_message_pair TO authenticated;
GRANT EXECUTE ON FUNCTION create_message_pair TO service_role;

GRANT EXECUTE ON FUNCTION update_message_pair_status TO anon;
GRANT EXECUTE ON FUNCTION update_message_pair_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_message_pair_status TO service_role;

GRANT EXECUTE ON FUNCTION complete_message_pair TO anon;
GRANT EXECUTE ON FUNCTION complete_message_pair TO authenticated;
GRANT EXECUTE ON FUNCTION complete_message_pair TO service_role;

GRANT EXECUTE ON FUNCTION cancel_message_pair TO anon;
GRANT EXECUTE ON FUNCTION cancel_message_pair TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_message_pair TO service_role;

-- Grant table permissions
GRANT ALL ON chat_history TO anon;
GRANT ALL ON chat_history TO authenticated;
GRANT ALL ON chat_history TO service_role;

GRANT ALL ON chats TO anon;
GRANT ALL ON chats TO authenticated;
GRANT ALL ON chats TO service_role;

-- Add specific permissions for get_chat_messages
GRANT EXECUTE ON FUNCTION get_chat_messages TO anon;
GRANT EXECUTE ON FUNCTION get_chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_messages TO service_role;

-- Ensure proper table access
GRANT SELECT ON chat_history TO anon;
GRANT SELECT ON chat_history TO authenticated;
GRANT SELECT ON chat_history TO service_role; 