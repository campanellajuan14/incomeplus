-- Enable realtime for user_messages table
ALTER TABLE public.user_messages REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_messages;