-- Create RLS policies for properties table to allow public access to approved properties

-- Policy for public access to approved properties (for anonymous and authenticated users)
CREATE POLICY "Public can view approved properties" 
ON public.properties 
FOR SELECT 
USING (
  approval_status = 'approved' 
  AND status = 'active' 
  AND flagged = false
);

-- Policy for property owners to manage their own properties
CREATE POLICY "Users can manage their own properties" 
ON public.properties 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for admin users to manage all properties
CREATE POLICY "Admins can manage all properties" 
ON public.properties 
FOR ALL 
USING (check_admin_access(auth.uid()))
WITH CHECK (check_admin_access(auth.uid()));