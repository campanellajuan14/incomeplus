-- Update the handle_new_user function to use the new metadata structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  full_name text;
  first_name text;
  last_name text;
BEGIN
  -- Get the name data from user metadata with fallbacks
  first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  
  -- If first_name is empty but we have a full name, split it
  IF first_name = '' AND NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
    full_name := trim(NEW.raw_user_meta_data->>'name');
    first_name := COALESCE(split_part(full_name, ' ', 1), '');
    -- Get everything after the first space as last name
    last_name := COALESCE(trim(substring(full_name from position(' ' in full_name) + 1)), '');
  END IF;
  
  -- Default to 'User' if still empty
  IF first_name = '' THEN
    first_name := 'User';
  END IF;
  
  INSERT INTO public.user_profiles (user_id, first_name, last_name, email_notifications)
  VALUES (
    NEW.id,
    first_name,
    last_name,
    true
  );
  
  RETURN NEW;
END;
$function$;