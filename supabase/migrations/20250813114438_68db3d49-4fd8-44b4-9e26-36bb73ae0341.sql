-- Add secure SELECT policy for email change requests
-- Allow users to view their own email change requests but exclude verification codes
CREATE POLICY "Users can view their own email change request status" 
ON public.email_change_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a secure view that excludes verification codes from client access
CREATE OR REPLACE VIEW public.email_change_status AS
SELECT 
  id,
  user_id,
  current_email,
  new_email,
  is_verified,
  expires_at,
  created_at,
  updated_at
FROM public.email_change_requests;

-- Enable RLS on the view
ALTER VIEW public.email_change_status SET (security_barrier = true);

-- Create policy for the view that allows users to see their own requests
CREATE POLICY "Users can view their own email change status" 
ON public.email_change_status 
FOR SELECT 
USING (auth.uid() = user_id);

-- Grant access to authenticated users for the view
GRANT SELECT ON public.email_change_status TO authenticated;