-- Create admin user using the existing bootstrap mechanism
-- The system already has handle_admin_signup() function that creates the first admin automatically

-- Check current admin count
DO $$
DECLARE
    admin_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM admin_users WHERE status = 'active';
    RAISE NOTICE 'Current active admin count: %', admin_count;
    
    IF admin_count = 0 THEN
        RAISE NOTICE 'No active admins found. The first user to sign up with any email will become admin automatically.';
        RAISE NOTICE 'Please sign up at /admin/login with email: juancampanella88@gmail.com and password: incomeplusok!';
    ELSE
        RAISE NOTICE 'Active admins already exist. Cannot auto-create admin user.';
    END IF;
END $$;

-- Verify the bootstrap mechanism is working
SELECT bootstrap_needed() AS can_bootstrap_admin;