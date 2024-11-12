export type ChatHistory = {
  id: string;
  chat_id: string;
  user_content?: string;
  assistant_content?: string;
  domination_field: string;
  created_at: string;
  is_active: boolean;
  model?: string;
}; 