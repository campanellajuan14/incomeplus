-- Create a function to add admin privileges to any user signing up through admin panel
CREATE OR REPLACE FUNCTION public.create_admin_user(
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
  -- Insert admin user record (bypasses RLS restrictions)
  INSERT INTO admin_users (user_id, name, email, role, status, created_at, updated_at)
  VALUES (
    target_user_id,
    admin_name,
    admin_email,
    'admin',
    'active',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = 'admin',
    status = 'active',
    updated_at = now();
  
  -- Log the admin creation
  INSERT INTO admin_audit_log (
    admin_user_id,
    action,
    details,
    created_at
  ) VALUES (
    target_user_id,
    'admin_user_created_via_signup',
    jsonb_build_object(
      'email', admin_email,
      'name', admin_name,
      'timestamp', now()
    ),
    now()
  );
  
  RETURN true;
END;
$$;