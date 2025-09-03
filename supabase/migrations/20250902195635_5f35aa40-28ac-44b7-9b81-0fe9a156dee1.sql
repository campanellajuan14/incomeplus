-- Fix Admin Data Security Issues

-- First, drop potentially insecure functions that expose admin information
DROP FUNCTION IF EXISTS public.get_admin_basic_info();
DROP FUNCTION IF EXISTS public.get_admin_directory();

-- Create a more secure function that only returns minimal admin information
CREATE OR REPLACE FUNCTION public.get_admin_count_only()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND status = 'active'
      ) 
      THEN (
        SELECT COUNT(*)::INTEGER 
        FROM admin_users 
        WHERE status = 'active'
      )
      ELSE 0
    END;
$$;

-- Enhance the admin verification function with additional security
CREATE OR REPLACE FUNCTION public.check_admin_access(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return false immediately if no user_id provided
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user exists and is an active admin with additional validation
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = check_admin_access.user_id 
    AND status = 'active'
    AND created_at IS NOT NULL -- Additional validation
    AND email IS NOT NULL -- Ensure complete admin record
  );
END;
$$;

-- Remove the get_admin_summary function that might expose admin counts inappropriately
DROP FUNCTION IF EXISTS public.get_admin_summary();

-- Update RLS policies on admin_users table to be more restrictive
DROP POLICY IF EXISTS "admin_users_verified_select" ON public.admin_users;

-- Create new restrictive policy that only allows users to see their own admin profile
CREATE POLICY "admin_users_own_profile_only" 
ON public.admin_users 
FOR SELECT 
USING (
  user_id = auth.uid() 
  AND status = 'active'
);

-- Ensure admin audit logs are only accessible to the admin who performed the action
DROP POLICY IF EXISTS "Verified admins can view audit logs" ON public.admin_audit_log;

CREATE POLICY "Admins can only view their own audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (
  admin_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Add additional security to agent contact access logs
DROP POLICY IF EXISTS "admins_can_view_contact_access_log" ON public.agent_contact_access_log;

CREATE POLICY "admins_can_view_contact_access_summary_only" 
ON public.agent_contact_access_log 
FOR SELECT 
USING (
  -- Only allow viewing aggregate access patterns, not individual records
  false -- This will be handled through secure functions only
);

-- Create a secure function for admin statistics that doesn't expose individual admin data
CREATE OR REPLACE FUNCTION public.get_secure_admin_stats()
RETURNS TABLE(active_admin_count integer, total_actions_today integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return stats if requester is verified admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  ) THEN
    RETURN QUERY SELECT 0::integer, 0::integer;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::integer as active_admin_count,
    (
      SELECT COUNT(*)::integer 
      FROM admin_audit_log 
      WHERE DATE(created_at) = CURRENT_DATE
    ) as total_actions_today
  FROM admin_users 
  WHERE status = 'active';
END;
$$;

-- Add comment for security documentation
COMMENT ON FUNCTION public.get_secure_admin_stats() IS 'Provides minimal admin statistics without exposing individual admin information. Only accessible to verified admins.';

COMMENT ON POLICY "admin_users_own_profile_only" ON public.admin_users IS 'Restricts admin users to only view their own profile information, preventing unauthorized access to other admin data.';