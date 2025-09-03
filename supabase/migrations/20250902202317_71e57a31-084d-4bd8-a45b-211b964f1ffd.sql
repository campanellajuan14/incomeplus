-- Maximum Security Implementation for Admin Data

-- Create a completely isolated admin access system
-- Step 1: Remove all existing policies on admin_users table
DROP POLICY IF EXISTS "admin_users_ultimate_security" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_bootstrap_or_verified_insert" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_verified_delete_with_safeguard" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_verified_update" ON public.admin_users;

-- Step 2: Create the most restrictive possible policy - own record only, no exceptions
CREATE POLICY "admin_users_maximum_security" 
ON public.admin_users 
FOR SELECT
USING (
  -- Triple verification: user owns record, is active, and authenticated
  user_id = auth.uid() 
  AND status = 'active'
  AND auth.uid() IS NOT NULL
  AND auth.role() = 'authenticated'
);

-- Separate policy for INSERT (bootstrap and verified admin creation)
CREATE POLICY "admin_users_secure_insert" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (
  -- Allow bootstrap (first admin) OR verified admin creating new admin
  (NOT EXISTS (SELECT 1 FROM admin_users WHERE status = 'active'))
  OR 
  (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM admin_users existing 
      WHERE existing.user_id = auth.uid() 
      AND existing.status = 'active'
    )
  )
);

-- Separate policy for UPDATE (only own records)
CREATE POLICY "admin_users_secure_update" 
ON public.admin_users 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  AND status = 'active'
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  user_id = auth.uid() 
  AND auth.uid() IS NOT NULL
);

-- Separate policy for DELETE (with safeguard against deleting last admin)
CREATE POLICY "admin_users_secure_delete" 
ON public.admin_users 
FOR DELETE 
USING (
  user_id = auth.uid() 
  AND status = 'active'
  AND EXISTS (
    SELECT 1 FROM admin_users other 
    WHERE other.status = 'active' 
    AND other.user_id != admin_users.user_id
  )
);

-- Create secure admin check function with maximum validation
CREATE OR REPLACE FUNCTION public.verify_admin_identity()
RETURNS TABLE(is_admin boolean, admin_id uuid, admin_email text)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Return false immediately for unauthenticated users
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text;
    RETURN;
  END IF;

  -- Get admin record with strict validation
  SELECT * INTO admin_record 
  FROM admin_users 
  WHERE user_id = current_user_id 
    AND status = 'active'
    AND email IS NOT NULL
    AND name IS NOT NULL
    AND created_at IS NOT NULL;

  -- Return admin status and minimal safe information
  IF admin_record.id IS NOT NULL THEN
    RETURN QUERY SELECT true, admin_record.id, admin_record.email;
  ELSE
    RETURN QUERY SELECT false, NULL::uuid, NULL::text;
  END IF;
END;
$$;

-- Remove any functions that could expose admin data in bulk
DROP FUNCTION IF EXISTS public.get_admin_count_only();
DROP FUNCTION IF EXISTS public.get_admin_count_safe();
DROP FUNCTION IF EXISTS public.get_secure_admin_stats();

-- Create ultra-minimal admin verification function
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
      AND status = 'active'
      AND auth.uid() IS NOT NULL
      AND auth.role() = 'authenticated'
  );
$$;

-- Update check_admin_access function with maximum security
CREATE OR REPLACE FUNCTION public.check_admin_access(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Fail immediately for any invalid input
  IF user_id IS NULL OR auth.uid() IS NULL OR auth.role() != 'authenticated' THEN
    RETURN false;
  END IF;
  
  -- Only allow checking own admin status
  IF user_id != auth.uid() THEN
    RETURN false;
  END IF;
  
  -- Strict admin verification with multiple checks
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = user_id 
      AND status = 'active'
      AND created_at IS NOT NULL
      AND email IS NOT NULL
      AND name IS NOT NULL
  );
END;
$$;

-- Add comprehensive security documentation
COMMENT ON POLICY "admin_users_maximum_security" ON public.admin_users IS 'Maximum security SELECT policy - users can ONLY view their own admin record with triple authentication verification.';
COMMENT ON FUNCTION public.verify_admin_identity() IS 'Ultra-secure admin verification returning minimal necessary information only for the authenticated user.';
COMMENT ON FUNCTION public.is_authenticated_admin() IS 'Simple boolean check if current authenticated user is an active admin - no data exposure.';
COMMENT ON FUNCTION public.check_admin_access(uuid) IS 'Enhanced security function that only allows users to verify their own admin status with strict validation.';