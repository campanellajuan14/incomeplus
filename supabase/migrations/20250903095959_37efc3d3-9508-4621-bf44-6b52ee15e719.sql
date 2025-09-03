-- Add the existing user as an admin
INSERT INTO admin_users (user_id, name, email, role, status)
VALUES (
  '2e6c3f80-6998-4efa-9a97-a8baafab71ed'::uuid,
  'Admin User',
  'juancampanella88@gmail.com',
  'admin',
  'active'
) ON CONFLICT (user_id) DO NOTHING;

-- Create a function to automatically add admin users when they sign up through admin panel
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is an admin signup (has name in metadata)
  IF NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
    INSERT INTO public.admin_users (user_id, name, email, role, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Admin User'),
      NEW.email,
      'admin',
      'active'
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic admin user creation
DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
CREATE TRIGGER on_admin_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_signup();