-- Fix security vulnerability: Remove public read access to user_profiles
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can read basic profile info" ON public.user_profiles;

-- Create more restrictive policies for user profiles
-- Users can always see their own profile completely
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can see basic info of people they have conversations with
CREATE POLICY "Users can view profiles of conversation participants" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_conversations 
    WHERE (participant_1_id = auth.uid() AND participant_2_id = user_profiles.user_id)
       OR (participant_2_id = auth.uid() AND participant_1_id = user_profiles.user_id)
  )
);

-- Users can see basic info of people they have direct messages with
CREATE POLICY "Users can view profiles of message contacts" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_messages 
    WHERE (sender_id = auth.uid() AND recipient_id = user_profiles.user_id)
       OR (recipient_id = auth.uid() AND sender_id = user_profiles.user_id)
  )
);

-- Property owners can see profiles of users who inquired about their properties
CREATE POLICY "Property owners can view inquirer profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.property_inquiries pi
    JOIN public.properties p ON pi.property_id = p.id
    WHERE p.user_id = auth.uid() AND pi.user_id = user_profiles.user_id
  )
);