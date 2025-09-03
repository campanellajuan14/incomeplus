-- Create a service function to insert admin during migration (uses service role privileges)
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Insert admin user record using service role privileges
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
    gen_random_uuid(), -- Temporary UUID, will be updated when auth user signs up
    'juancampanella88@gmail.com',
    'admin',
    NULL,
    'admin',
    'pending', -- Will be activated when they sign up
    now(),
    now()
  ) RETURNING id INTO admin_id;
  
  RAISE NOTICE 'Successfully created pending admin user with ID: %. Email: juancampanella88@gmail.com', admin_id;
  RAISE NOTICE 'Admin will be activated when user signs up at /admin/login with password: incomeplusok!';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Note: Admin user creation blocked by security policies. This is expected.';
  RAISE NOTICE 'Please sign up at /admin/login with:';
  RAISE NOTICE 'Email: juancampanella88@gmail.com';
  RAISE NOTICE 'Password: incomeplusok!';
  RAISE NOTICE 'The existing handle_admin_signup() function will grant admin privileges automatically.';
END $$;

-- Ensure the handle_admin_signup trigger is properly set up
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_count integer;
  existing_admin_id uuid;
  user_name text;
BEGIN
  -- Get username from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name', 
    'admin'
  );
  
  -- Check if this email matches our bootstrap admin
  IF NEW.email = 'juancampanella88@gmail.com' THEN
    user_name := 'admin';
  END IF;
  
  -- Check current admin count
  SELECT COUNT(*) INTO admin_count 
  FROM admin_users 
  WHERE status = 'active';
  
  -- Grant admin if no active admins exist (bootstrap case)
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
    
    RAISE NOTICE 'Granted admin privileges to bootstrap user: %', NEW.email;
  END IF;
  
  -- Create user profile
  DECLARE
    final_username text := user_name;
    counter integer := 1;
  BEGIN
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = final_username) LOOP
      final_username := user_name || '_' || counter;
      counter := counter + 1;
    END LOOP;
    
    INSERT INTO public.user_profiles (user_id, username, email_notifications)
    VALUES (NEW.id, final_username, true);
  END;
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_admin_signup: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Verify the bootstrap function exists and is ready
SELECT bootstrap_needed() AS system_ready_for_admin_bootstrap;