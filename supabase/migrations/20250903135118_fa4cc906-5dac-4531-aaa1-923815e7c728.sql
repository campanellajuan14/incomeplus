-- Fix user profile access by completely rebuilding RLS policies

-- Drop ALL existing policies on user_profiles table
DO $$ 
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.user_profiles';
    END LOOP;
END $$;

-- Create function to ensure user profile exists with auto-creation
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
  
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM user_profiles 
    WHERE user_id = current_user_id
  ) INTO profile_exists;
  
  -- Create profile if it doesn't exist
  IF NOT profile_exists THEN
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

-- Create new comprehensive RLS policies for user_profiles

-- 1. Users can view their own profile
CREATE POLICY "users_can_view_own_profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can update their own profile
CREATE POLICY "users_can_update_own_profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Users can insert their own profile
CREATE POLICY "users_can_insert_own_profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own profile
CREATE POLICY "users_can_delete_own_profile" 
ON public.user_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Admins can manage all profiles
CREATE POLICY "admins_can_manage_all_profiles" 
ON public.user_profiles 
FOR ALL 
USING (check_admin_access(auth.uid()))
WITH CHECK (check_admin_access(auth.uid()));

-- 6. Basic profile info visible to authenticated users for platform features
CREATE POLICY "basic_profile_info_for_authenticated" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND account_status = 'active'
);

-- Create function to get or create user profile safely
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

  -- Ensure profile exists
  PERFORM ensure_user_profile_exists();
  
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

-- Update the handle_new_user trigger to ensure it works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_name text;
BEGIN
  -- Get username from metadata, fallback to email prefix or generate one
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name', 
    split_part(NEW.email, '@', 1)
  );
  
  -- Ensure username is not empty and make it unique if needed
  IF user_name IS NULL OR trim(user_name) = '' THEN
    user_name := 'user_' || substring(NEW.id::text from 1 for 8);
  END IF;
  
  -- Handle potential duplicates by appending a number
  DECLARE
    final_username text := user_name;
    counter integer := 1;
  BEGIN
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = final_username) LOOP
      final_username := user_name || '_' || counter;
      counter := counter + 1;
    END LOOP;
    
    INSERT INTO public.user_profiles (
      user_id, 
      username, 
      user_type,
      account_status,
      email_notifications,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      final_username,
      'investor',
      'active',
      true,
      now(),
      now()
    );
  END;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add helpful comment
COMMENT ON TABLE public.user_profiles IS 'User profiles with automatic creation and secure RLS policies';