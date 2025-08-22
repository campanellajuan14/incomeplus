-- Fix security vulnerability: Restrict property viewing to authenticated users only
-- Drop the overly permissive policy that allows anonymous access
DROP POLICY IF EXISTS "Users can view all properties" ON public.properties;

-- Create a more secure policy that requires authentication
CREATE POLICY "Authenticated users can view all properties" 
ON public.properties 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Keep existing policies for other operations (they already have proper restrictions)
-- Users can create their own properties - already exists
-- Users can update their own properties - already exists  
-- Users can delete their own properties - already exists