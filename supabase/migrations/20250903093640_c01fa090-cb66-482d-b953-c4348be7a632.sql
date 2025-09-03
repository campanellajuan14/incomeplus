-- Create a bootstrap admin record using a service role function
CREATE OR REPLACE FUNCTION create_bootstrap_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use INSERT with ON CONFLICT to safely create the admin record
  INSERT INTO admin_users (
    user_id,
    email,
    name,
    role,
    status,
    created_at,
    updated_at
  ) 
  SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid, -- Temporary placeholder UUID
    'juancampanella88@gmail.com',
    'admin',
    'admin',
    'bootstrap_pending', -- Special status for bootstrap
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = 'juancampanella88@gmail.com'
  );
  
  RAISE NOTICE 'Bootstrap admin record created for: juancampanella88@gmail.com';
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Note: Admin record may already exist or security policies prevented creation';
END;
$$;

-- Execute the bootstrap function
SELECT create_bootstrap_admin();

-- Update handle_admin_signup to handle bootstrap_pending status
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
  
  -- Check for bootstrap_pending admin with this email  
  SELECT id INTO existing_admin_id 
  FROM admin_users 
  WHERE email = NEW.email AND status = 'bootstrap_pending';
  
  IF existing_admin_id IS NOT NULL THEN
    -- Activate the bootstrap admin
    UPDATE admin_users 
    SET 
      user_id = NEW.id,
      status = 'active',
      name = user_name,
      updated_at = now()
    WHERE id = existing_admin_id;
    
    RAISE NOTICE 'Activated bootstrap admin: %', NEW.email;
  ELSE
    -- Regular bootstrap logic for first admin
    SELECT COUNT(*) INTO admin_count 
    FROM admin_users 
    WHERE status = 'active';
    
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
  
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, username, email_notifications)
  VALUES (NEW.id, user_name, true)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_admin_signup: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Clean up the bootstrap function (no longer needed)
DROP FUNCTION IF EXISTS create_bootstrap_admin();