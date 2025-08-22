-- Update RLS policy to allow all users to view all properties
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;

CREATE POLICY "Users can view all properties"
ON public.properties
FOR SELECT
TO authenticated
USING (true);