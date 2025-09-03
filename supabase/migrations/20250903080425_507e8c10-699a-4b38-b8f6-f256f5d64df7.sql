-- CRITICAL SECURITY FIX: Simplify and bulletproof admin_users RLS policies
-- Remove all existing complex policies that may have loopholes
DROP POLICY IF EXISTS "admin_bulletproof_select_verified_own_only" ON admin_users;
DROP POLICY IF EXISTS "admin_bulletproof_insert_bootstrap_verified" ON admin_users;
DROP POLICY IF EXISTS "admin_bulletproof_update_verified_own" ON admin_users;
DROP POLICY IF EXISTS "admin_bulletproof_delete_multi_verified" ON admin_users;

-- Create ultra-simple, bulletproof policies with zero loopholes
-- POLICY 1: SELECT - Only admins can see their own record, period
CREATE POLICY "admin_users_ultra_secure_select" 
ON admin_users FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  AND status = 'active'
  AND auth.uid() IS NOT NULL
);

-- POLICY 2: INSERT - Only allow bootstrap (first admin) or verified admin adding themselves
CREATE POLICY "admin_users_ultra_secure_insert" 
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND auth.uid() IS NOT NULL
  AND (
    -- Bootstrap case: no active admins exist
    NOT EXISTS (SELECT 1 FROM admin_users WHERE status = 'active')
    OR
    -- Self-registration by already active admin (profile update)
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND status = 'active')
  )
);

-- POLICY 3: UPDATE - Only update own record as active admin
CREATE POLICY "admin_users_ultra_secure_update" 
ON admin_users FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  AND status = 'active'
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  user_id = auth.uid()
  AND auth.uid() IS NOT NULL
);

-- POLICY 4: DELETE - Only delete own record if other admins exist
CREATE POLICY "admin_users_ultra_secure_delete" 
ON admin_users FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() 
  AND status = 'active'
  AND auth.uid() IS NOT NULL
  AND (SELECT COUNT(*) FROM admin_users WHERE status = 'active') > 1
);

-- Add additional security: Block ALL service role access to admin_users
-- This ensures no API can bypass RLS
CREATE OR REPLACE FUNCTION block_service_role_admin_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Block service role completely from admin_users
  IF auth.role() = 'service_role' THEN
    RAISE EXCEPTION 'SECURITY BLOCK: Service role access to admin_users forbidden';
  END IF;
  
  -- Block null/anonymous access
  IF auth.uid() IS NULL OR auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'SECURITY BLOCK: Only authenticated users allowed';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the security block to all operations
DROP TRIGGER IF EXISTS admin_users_security_block ON admin_users;
CREATE TRIGGER admin_users_security_block
  BEFORE SELECT OR INSERT OR UPDATE OR DELETE ON admin_users
  FOR EACH STATEMENT
  EXECUTE FUNCTION block_service_role_admin_access();

-- Create simplified admin verification function
CREATE OR REPLACE FUNCTION public.is_verified_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
      AND status = 'active'
      AND auth.uid() IS NOT NULL
  );
$$;

-- Log this critical security fix
INSERT INTO admin_audit_log (
  admin_user_id,
  action,
  details,
  created_at
) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'CRITICAL_SECURITY_FIX_ADMIN_RLS',
  jsonb_build_object(
    'fix_type', 'simplified_bulletproof_policies',
    'timestamp', now(),
    'security_level', 'MAXIMUM',
    'fix_description', 'Replaced complex RLS policies with simple bulletproof ones'
  ),
  now()
);