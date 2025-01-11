-- Create chat_attachments table
CREATE TABLE IF NOT EXISTS public.chat_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.chat_history(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX chat_attachments_chat_id_idx ON public.chat_attachments(chat_id);
CREATE INDEX chat_attachments_message_id_idx ON public.chat_attachments(message_id);

-- Add RLS policies
ALTER TABLE public.chat_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat attachments"
  ON public.chat_attachments
  FOR SELECT
  USING (
    chat_id IN (
      SELECT id FROM public.chats
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments for their own chats"
  ON public.chat_attachments
  FOR INSERT
  WITH CHECK (
    chat_id IN (
      SELECT id FROM public.chats
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own attachments"
  ON public.chat_attachments
  FOR DELETE
  USING (
    chat_id IN (
      SELECT id FROM public.chats
      WHERE user_id = auth.uid()
    )
  );

-- Create storage bucket for chat attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat attachments
CREATE POLICY "Users can upload chat attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view chat attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
  );

CREATE POLICY "Users can delete their own chat attachments"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'chat-attachments' AND
    auth.role() = 'authenticated'
  ); 