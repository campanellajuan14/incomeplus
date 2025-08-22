-- Fix critical security vulnerability: Restrict property viewing to only property owners
-- Drop the current policy that allows all authenticated users to view all properties
DROP POLICY IF EXISTS "Authenticated users can view all properties" ON public.properties;

-- Create a secure policy that only allows property owners to view their own properties
CREATE POLICY "Users can only view their own properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = user_id);

-- Keep existing policies for other operations (they already have proper owner restrictions)
-- Users can create their own properties - already exists and is properly restricted
-- Users can update their own properties - already exists and is properly restricted  
-- Users can delete their own properties - already exists and is properly restricted