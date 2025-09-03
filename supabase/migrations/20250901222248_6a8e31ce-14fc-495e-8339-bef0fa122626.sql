-- Drop all existing policies for email_change_requests
DROP POLICY IF EXISTS "Users can create their own email change requests" ON public.email_change_requests;
DROP POLICY IF EXISTS "Users can view their own email change requests" ON public.email_change_requests;
DROP POLICY IF EXISTS "Users can update their own email change requests" ON public.email_change_requests;
DROP POLICY IF EXISTS "Users can delete their own email change requests" ON public.email_change_requests;

-- Create proper RLS policies
CREATE POLICY "Users can create their own email change requests" 
ON public.email_change_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own email change requests" 
ON public.email_change_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email change requests" 
ON public.email_change_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email change requests" 
ON public.email_change_requests 
FOR DELETE 
USING (auth.uid() = user_id);