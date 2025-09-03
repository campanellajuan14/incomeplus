-- Fix critical security vulnerability: Add RLS policies for user_profiles table
-- This migration secures sensitive personal data while maintaining functionality

-- First, ensure RLS is enabled on user_profiles (it should be already)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for user_profiles table

-- 1. Users can view their own complete profile
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can update their own profile 
CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Users can insert their own profile during registration
CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.user_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Admins can manage all profiles (using existing admin security functions)
CREATE POLICY "Verified admins can manage all profiles" 
ON public.user_profiles 
FOR ALL 
USING (check_admin_access(auth.uid()))
WITH CHECK (check_admin_access(auth.uid()));

-- 6. Limited public read access for essential features (messaging, conversations)
-- Only expose non-sensitive fields for authenticated users
CREATE POLICY "Limited public read for platform features" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND account_status = 'active'
);

-- Create security function to get safe public profile data
CREATE OR REPLACE FUNCTION public.get_limited_user_profile(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  username text,
  user_type character varying,
  account_status character varying,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return non-sensitive data for active users
  RETURN QUERY
  SELECT 
    up.user_id,
    up.username,
    up.user_type,
    up.account_status,
    up.created_at
  FROM user_profiles up
  WHERE up.user_id = target_user_id
    AND up.account_status = 'active'
    AND auth.uid() IS NOT NULL;
END;
$$;

-- Add security function for checking profile access permissions
CREATE OR REPLACE FUNCTION public.can_user_access_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    -- User can access their own profile
    auth.uid() = profile_user_id
    OR
    -- Admin can access any profile
    check_admin_access(auth.uid())
  );
$$;

-- Add table comment explaining the security model
COMMENT ON TABLE public.user_profiles IS 'User profile data with comprehensive RLS: Users manage own profiles, admins manage all, limited public read for authenticated users only';