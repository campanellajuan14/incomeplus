-- Create user_messages table for direct user-to-user messaging
CREATE TABLE public.user_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    related_property_id uuid,
    conversation_id uuid NOT NULL DEFAULT gen_random_uuid()
);

-- Create index for performance
CREATE INDEX idx_user_messages_conversation_id ON public.user_messages(conversation_id);
CREATE INDEX idx_user_messages_sender_id ON public.user_messages(sender_id);
CREATE INDEX idx_user_messages_recipient_id ON public.user_messages(recipient_id);
CREATE INDEX idx_user_messages_created_at ON public.user_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for user messages
CREATE POLICY "Users can view messages they sent or received"
    ON public.user_messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert their own messages"
    ON public.user_messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status of messages sent to them"
    ON public.user_messages
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_messages_updated_at
    BEFORE UPDATE ON public.user_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_conversations table to track unique conversations
CREATE TABLE public.user_conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id uuid NOT NULL,
    participant_2_id uuid NOT NULL,
    last_message_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(participant_1_id, participant_2_id)
);

-- Enable RLS for conversations
ALTER TABLE public.user_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view conversations they participate in"
    ON public.user_conversations
    FOR SELECT
    USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations with others"
    ON public.user_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can update conversations they participate in"
    ON public.user_conversations
    FOR UPDATE
    USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);