-- Create table for DM chat messages
CREATE TABLE public.dm_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_dm_chat_messages_campaign_id ON public.dm_chat_messages(campaign_id);
CREATE INDEX idx_dm_chat_messages_created_at ON public.dm_chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.dm_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own chat messages"
  ON public.dm_chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON public.dm_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);