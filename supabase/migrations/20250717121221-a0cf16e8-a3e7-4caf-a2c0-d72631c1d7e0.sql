-- Fix the trigger to properly handle the name field from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  full_name text;
  name_parts text[];
BEGIN
  -- Get the full name from user metadata
  full_name := COALESCE(NEW.raw_user_meta_data->>'name', '');
  
  -- Split the name into parts
  name_parts := string_to_array(trim(full_name), ' ');
  
  INSERT INTO public.user_profiles (user_id, first_name, last_name, email_notifications)
  VALUES (
    NEW.id,
    COALESCE(name_parts[1], 'User'),
    COALESCE(array_to_string(name_parts[2:array_length(name_parts, 1)], ' '), ''),
    true
  );
  RETURN NEW;
END;
$$;

-- Update existing users' profiles with the correct name data
UPDATE public.user_profiles 
SET 
  first_name = COALESCE(
    (SELECT (string_to_array(trim(COALESCE(u.raw_user_meta_data->>'name', '')), ' '))[1] 
     FROM auth.users u WHERE u.id = user_profiles.user_id), 
    'User'
  ),
  last_name = COALESCE(
    (SELECT array_to_string(
       (string_to_array(trim(COALESCE(u.raw_user_meta_data->>'name', '')), ' '))[2:array_length(string_to_array(trim(COALESCE(u.raw_user_meta_data->>'name', '')), ' '), 1)], 
       ' '
     ) FROM auth.users u WHERE u.id = user_profiles.user_id), 
    ''
  )
WHERE user_id IS NOT NULL;