-- Enable real-time for user_messages table
ALTER TABLE public.user_messages REPLICA IDENTITY FULL;

-- Add user_messages table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_messages;