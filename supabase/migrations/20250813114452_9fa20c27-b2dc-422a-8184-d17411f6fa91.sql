-- Fix the approach: Create a secure view without RLS policies (views don't support them)
-- Drop the failed policy attempt
DROP POLICY IF EXISTS "Users can view their own email change status" ON public.email_change_status;

-- Recreate the view as a security definer function instead
DROP VIEW IF EXISTS public.email_change_status;

-- Create a security definer function to get email change status safely
CREATE OR REPLACE FUNCTION public.get_user_email_change_status()
RETURNS TABLE (
  id uuid,
  current_email text,
  new_email text,
  is_verified boolean,
  expires_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ecr.id,
    ecr.current_email,
    ecr.new_email,
    ecr.is_verified,
    ecr.expires_at,
    ecr.created_at,
    ecr.updated_at
  FROM email_change_requests ecr
  WHERE ecr.user_id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_email_change_status() TO authenticated;