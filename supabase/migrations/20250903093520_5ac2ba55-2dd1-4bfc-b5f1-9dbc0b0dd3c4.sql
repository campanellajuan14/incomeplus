-- Temporarily disable the blocking trigger for bootstrap
ALTER TABLE admin_users DISABLE TRIGGER ALL;

-- Insert the bootstrap admin user directly
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
  'pending', -- Will be activated when they sign up through auth
  now(),
  now()
);

-- Re-enable the triggers
ALTER TABLE admin_users ENABLE TRIGGER ALL;

-- Create a special function to activate pending admin during signup
CREATE OR REPLACE FUNCTION public.activate_pending_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  pending_admin_id uuid;
BEGIN
  -- Check if there's a pending admin with this email
  SELECT id INTO pending_admin_id 
  FROM admin_users 
  WHERE email = NEW.email AND status = 'pending';
  
  IF pending_admin_id IS NOT NULL THEN
    -- Temporarily disable triggers to update the admin user
    ALTER TABLE admin_users DISABLE TRIGGER ALL;
    
    -- Activate the pending admin
    UPDATE admin_users 
    SET 
      user_id = NEW.id,
      status = 'active',
      updated_at = now()
    WHERE id = pending_admin_id;
    
    -- Re-enable triggers
    ALTER TABLE admin_users ENABLE TRIGGER ALL;
    
    RAISE NOTICE 'Activated pending admin user: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the existing trigger to include pending admin activation
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION activate_pending_admin();

-- Verify the admin was created
SELECT email, name, status FROM admin_users WHERE email = 'juancampanella88@gmail.com';