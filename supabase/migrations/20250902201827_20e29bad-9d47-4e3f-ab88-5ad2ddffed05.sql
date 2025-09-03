-- Final Admin Security Lockdown - Remove Policy Conflicts

-- Drop all existing admin_users policies to eliminate conflicts
DROP POLICY IF EXISTS "admin_users_deny_anon_access" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_deny_public_access" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_secure_own_access" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_own_profile_only" ON public.admin_users;

-- Create a single, comprehensive security policy for admin_users table
CREATE POLICY "admin_users_ultimate_security" 
ON public.admin_users 
FOR ALL 
USING (
  -- Only allow access if the user is the owner of the admin record AND is active
  user_id = auth.uid() 
  AND status = 'active'
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  -- Same check for inserts/updates
  user_id = auth.uid() 
  AND status = 'active'
  AND auth.uid() IS NOT NULL
);

-- Ensure admin_actions table is properly secured
DROP POLICY IF EXISTS "Admins can create admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions;

CREATE POLICY "admin_actions_secure_access" 
ON public.admin_actions 
FOR ALL 
USING (
  -- Only allow admins to access their own actions
  admin_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
)
WITH CHECK (
  admin_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Add a function to safely check if current user is admin without exposing admin data
CREATE OR REPLACE FUNCTION public.am_i_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  );
$$;

-- Add admin user count function that doesn't expose individual records
CREATE OR REPLACE FUNCTION public.get_admin_count_safe()
RETURNS integer
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
      THEN (SELECT COUNT(*)::integer FROM admin_users WHERE status = 'active')
      ELSE NULL::integer
    END;
$$;

-- Add documentation
COMMENT ON POLICY "admin_users_ultimate_security" ON public.admin_users IS 'Ultimate security policy - only allows admin users to access their own records and prevents any cross-admin data exposure.';
COMMENT ON FUNCTION public.am_i_admin() IS 'Safely checks if current user is an active admin without exposing any admin data.';
COMMENT ON FUNCTION public.get_admin_count_safe() IS 'Returns admin count only to verified admins, prevents information disclosure to non-admins.';