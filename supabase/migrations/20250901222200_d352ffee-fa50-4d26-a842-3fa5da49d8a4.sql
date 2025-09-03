-- Drop existing INSERT policy and recreate it with proper user validation
DROP POLICY IF EXISTS "Users can create their own email change requests" ON public.email_change_requests;

-- Create proper INSERT policy that validates user_id matches auth.uid()
CREATE POLICY "Users can create their own email change requests" 
ON public.email_change_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create SELECT policy for users to view their own requests
CREATE POLICY "Users can view their own email change requests" 
ON public.email_change_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create UPDATE policy for users to update their own requests
CREATE POLICY "Users can update their own email change requests" 
ON public.email_change_requests 
FOR UPDATE 
USING (auth.uid() = user_id);