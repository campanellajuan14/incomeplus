-- Fix user profile access issues and ensure automatic profile creation

-- First, check if user profile exists for the current user and create if missing
CREATE OR REPLACE FUNCTION public.ensure_user_profile_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  profile_exists boolean;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM user_profiles 
    WHERE user_id = current_user_id
  ) INTO profile_exists;
  
  -- Create profile if it doesn't exist
  IF NOT profile_exists AND current_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (
      user_id, 
      username, 
      user_type, 
      account_status,
      email_notifications, 
      sms_notifications,
      created_at,
      updated_at
    ) VALUES (
      current_user_id,
      COALESCE(
        (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = current_user_id),
        (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = current_user_id),
        'user_' || substring(current_user_id::text from 1 for 8)
      ),
      'investor',
      'active',
      true,
      false,
      now(),
      now()
    );
  END IF;
END;
$$;

-- Update the existing RLS policies to be more permissive for legitimate access
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Verified admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Limited public read for platform features" ON public.user_profiles;

-- Create improved RLS policies
-- 1. Users can view their own profile (with automatic profile creation)
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NOT NULL AND public.ensure_user_profile_exists() IS NOT NULL AND auth.uid() = user_id)
);

-- 2. Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Users can insert their own profile (for registration)
CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Admins can manage all profiles
CREATE POLICY "Verified admins can manage all profiles" 
ON public.user_profiles 
FOR ALL 
USING (check_admin_access(auth.uid()))
WITH CHECK (check_admin_access(auth.uid()));

-- 5. Limited public access for authenticated users (messaging, etc.)
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND account_status = 'active'
);

-- Create a safer function to get user profile with auto-creation
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  user_id uuid,
  username text,
  user_type character varying,
  account_status character varying,
  phone character varying,
  company character varying,
  bio text,
  email_notifications boolean,
  sms_notifications boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_exists boolean;
BEGIN
  -- Only allow access to own profile unless admin
  IF target_user_id != auth.uid() AND NOT check_admin_access(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Can only access own profile';
  END IF;

  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = target_user_id
  ) INTO profile_exists;
  
  -- Create profile if it doesn't exist
  IF NOT profile_exists AND target_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (
      user_id, 
      username, 
      user_type, 
      account_status,
      email_notifications, 
      sms_notifications,
      created_at,
      updated_at
    ) VALUES (
      target_user_id,
      COALESCE(
        (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = target_user_id),
        (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = target_user_id),
        'user_' || substring(target_user_id::text from 1 for 8)
      ),
      'investor',
      'active',
      true,
      false,
      now(),
      now()
    );
  END IF;
  
  -- Return the profile
  RETURN QUERY
  SELECT 
    up.user_id,
    up.username,
    up.user_type,
    up.account_status,
    up.phone,
    up.company,
    up.bio,
    up.email_notifications,
    up.sms_notifications,
    up.created_at,
    up.updated_at
  FROM user_profiles up
  WHERE up.user_id = target_user_id;
END;
$$;