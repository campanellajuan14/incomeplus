-- Create admin user with provided credentials
-- This will create the admin user in auth.users and admin_users tables

-- First, insert into auth.users (this requires service role privileges)
-- We'll use a function that can be called to create the admin user

CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
  existing_admin_count integer;
BEGIN
  -- Check if admin already exists
  SELECT COUNT(*) INTO existing_admin_count 
  FROM admin_users 
  WHERE email = 'juancampanella88@gmail.com' AND status = 'active';
  
  IF existing_admin_count > 0 THEN
    RAISE NOTICE 'Admin user already exists';
    RETURN;
  END IF;
  
  -- Insert directly into admin_users table
  -- The auth user will be created when they first sign up
  INSERT INTO admin_users (
    user_id,
    email,
    name,
    status,
    role,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(), -- Temporary UUID, will be updated when user signs up
    'juancampanella88@gmail.com',
    'admin',
    'pending', -- Will be activated when user completes signup
    'admin',
    now(),
    now()
  );
  
  RAISE NOTICE 'Admin user record created. User must sign up with email: juancampanella88@gmail.com';
END;
$$;

-- Execute the function to create admin user
SELECT create_admin_user();

-- Create a function to activate admin user after auth signup
CREATE OR REPLACE FUNCTION activate_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this email corresponds to a pending admin
  UPDATE admin_users 
  SET 
    user_id = NEW.id,
    status = 'active',
    updated_at = now()
  WHERE 
    email = NEW.email 
    AND status = 'pending';
    
  RETURN NEW;
END;
$$;

-- Create trigger to activate admin when they complete signup
DROP TRIGGER IF EXISTS activate_admin_user_trigger ON auth.users;
CREATE TRIGGER activate_admin_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION activate_admin_on_signup();