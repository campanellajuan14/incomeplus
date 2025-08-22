-- Fix critical security vulnerability: Remove client access to verification codes
-- Drop the overly permissive policy that allows users to read verification codes
DROP POLICY IF EXISTS "Users can manage their own email change requests" ON public.email_change_requests;

-- Create secure policies that prevent reading verification codes on the client
-- Allow users to create email change requests
CREATE POLICY "Users can create their own email change requests" 
ON public.email_change_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own email change requests (to cancel)
CREATE POLICY "Users can delete their own email change requests" 
ON public.email_change_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- IMPORTANT: No SELECT policy - users cannot read verification codes
-- Verification must be handled server-side only

-- Create a security definer function for server-side email verification
CREATE OR REPLACE FUNCTION public.verify_email_change(
  verification_code_input text,
  user_id_input uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_record email_change_requests%ROWTYPE;
  result json;
BEGIN
  -- Find and validate the verification request
  SELECT * INTO request_record
  FROM email_change_requests
  WHERE user_id = user_id_input 
    AND verification_code = verification_code_input
    AND expires_at > now()
    AND is_verified = false;

  -- Check if request exists and is valid
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired verification code'
    );
  END IF;

  -- Mark as verified
  UPDATE email_change_requests
  SET is_verified = true, updated_at = now()
  WHERE id = request_record.id;

  -- Return success with new email (don't return the code)
  RETURN json_build_object(
    'success', true,
    'new_email', request_record.new_email
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_email_change(text, uuid) TO authenticated;