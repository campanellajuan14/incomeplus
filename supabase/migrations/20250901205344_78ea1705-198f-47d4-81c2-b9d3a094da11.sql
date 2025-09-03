-- First, migrate existing data by combining first_name and last_name into username
UPDATE user_profiles 
SET first_name = COALESCE(TRIM(CONCAT(first_name, ' ', last_name)), 'User')
WHERE first_name IS NOT NULL OR last_name IS NOT NULL;

-- Add username column (temporarily using first_name data)
ALTER TABLE user_profiles 
ADD COLUMN username TEXT;

-- Copy the concatenated names to username field
UPDATE user_profiles 
SET username = CASE 
  WHEN first_name IS NOT NULL AND first_name != '' THEN first_name
  ELSE 'User' || substring(user_id::text from 1 for 8)
END;

-- Add unique constraint to username
ALTER TABLE user_profiles 
ADD CONSTRAINT unique_username UNIQUE (username);

-- Make username not null
ALTER TABLE user_profiles 
ALTER COLUMN username SET NOT NULL;

-- Drop the old columns
ALTER TABLE user_profiles 
DROP COLUMN first_name,
DROP COLUMN last_name;

-- Update the handle_new_user function to use username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    INSERT INTO public.user_profiles (user_id, username, email_notifications)
    VALUES (
      NEW.id,
      final_username,
      true
    );
  END;
  
  RETURN NEW;
END;
$function$;