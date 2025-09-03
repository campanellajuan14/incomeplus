-- Create a special function to bootstrap the first admin user
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(
  target_user_id uuid,
  admin_name text,
  admin_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow this if no active admins exist (bootstrap scenario)
  IF EXISTS (SELECT 1 FROM admin_users WHERE status = 'active') THEN
    RETURN false; -- Already have active admins
  END IF;
  
  -- Insert the first admin user directly (bypassing normal security)
  INSERT INTO admin_users (user_id, name, email, role, status, created_at, updated_at)
  VALUES (
    target_user_id,
    admin_name,
    admin_email,
    'admin',
    'active',
    now(),
    now()
  );
  
  RETURN true;
END;
$$;

-- Bootstrap the first admin
SELECT public.bootstrap_first_admin(
  '2e6c3f80-6998-4efa-9a97-a8baafab71ed'::uuid,
  'Admin User',
  'juancampanella88@gmail.com'
);