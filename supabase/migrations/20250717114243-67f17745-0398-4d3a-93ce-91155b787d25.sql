-- Update RLS policy to allow reading other users' basic profile information for messaging
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;

-- Allow users to read basic profile info (names) from other users for messaging purposes
CREATE POLICY "Users can read basic profile info"
ON public.user_profiles
FOR SELECT
USING (true);

-- Allow users to manage their own profile
CREATE POLICY "Users can manage their own profile"
ON public.user_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a function to automatically create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, email_notifications)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    true
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users who don't have them
INSERT INTO public.user_profiles (user_id, first_name, last_name, email_notifications)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'first_name', 'User') as first_name,
  COALESCE(u.raw_user_meta_data->>'last_name', '') as last_name,
  true
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;