-- Create function to bootstrap admin user (bypasses RLS during setup)
CREATE OR REPLACE FUNCTION bootstrap_admin_user(
  admin_email text,
  admin_name text,
  admin_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_admin_id uuid;
BEGIN
  -- Only allow if no active admins exist
  IF EXISTS (SELECT 1 FROM admin_users WHERE status = 'active') THEN
    RAISE EXCEPTION 'Active admin users already exist. Cannot bootstrap.';
  END IF;
  
  -- Insert admin user record
  INSERT INTO admin_users (
    user_id,
    email,
    name,
    phone,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(), -- Temporary UUID, will be updated when auth user is created
    admin_email,
    admin_name,
    admin_phone,
    'admin',
    'pending', -- Will be activated when they sign up through auth
    now(),
    now()
  ) RETURNING id INTO new_admin_id;
  
  RAISE NOTICE 'Bootstrap admin user created with ID: %. Status: pending. Will be activated when user signs up with email: %', new_admin_id, admin_email;
  
  return new_admin_id;
END;
$$;

-- Bootstrap the admin user with provided credentials
SELECT bootstrap_admin_user(
  'juancampanella88@gmail.com',
  'admin',
  NULL
);

-- Update the handle_admin_signup function to activate existing pending admin
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  admin_count integer;
  existing_admin_id uuid;
  user_name text;
BEGIN
  -- Get username from metadata, fallback to email prefix or generate one
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name', 
    split_part(NEW.email, '@', 1)
  );
  
  -- Ensure username is not empty
  IF user_name IS NULL OR trim(user_name) = '' THEN
    user_name := 'user_' || substring(NEW.id::text from 1 for 8);
  END IF;
  
  -- Check if there's a pending admin with this email
  SELECT id INTO existing_admin_id 
  FROM admin_users 
  WHERE email = NEW.email AND status = 'pending';
  
  IF existing_admin_id IS NOT NULL THEN
    -- Activate the existing pending admin
    UPDATE admin_users 
    SET 
      user_id = NEW.id,
      status = 'active',
      updated_at = now()
    WHERE id = existing_admin_id;
    
    RAISE NOTICE 'Activated pending admin user: %', NEW.email;
  ELSE
    -- Check if this is the first admin (bootstrap case)
    SELECT COUNT(*) INTO admin_count 
    FROM admin_users 
    WHERE status = 'active';
    
    -- Only auto-approve if no active admins exist (bootstrap)
    IF admin_count = 0 THEN
      INSERT INTO admin_users (
        user_id, 
        email, 
        name, 
        status,
        role,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        user_name,
        'active',
        'admin',
        now(),
        now()
      );
    END IF;
  END IF;
  
  -- Create user profile regardless
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
EXCEPTION 
  WHEN OTHERS THEN
    -- Log error but don't fail user registration  
    RAISE LOG 'Error in handle_admin_signup: %', SQLERRM;
    RETURN NEW;
END;
$function$;