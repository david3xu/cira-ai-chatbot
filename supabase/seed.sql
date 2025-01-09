-- First insert into auth.users
INSERT INTO auth.users (id, email) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'default@example.com');

-- Then insert into public.users
INSERT INTO public.users (id, display_name) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Default User');

-- Then insert model settings
INSERT INTO public.model_settings (user_id, model, temperature)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '', 0.1);

-- Insert initial system prompts
INSERT INTO documents (content, domination_field, source, content_type, status)
VALUES 
  ('You are a helpful AI assistant.', 'general', 'system', 'text', 'completed'),
  ('You are a coding expert.', 'programming', 'system', 'text', 'completed'),
  ('You are a science expert.', 'science', 'system', 'text', 'completed');