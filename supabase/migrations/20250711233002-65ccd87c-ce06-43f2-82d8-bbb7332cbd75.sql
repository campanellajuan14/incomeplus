-- First, update existing status values to match frontend expectations
UPDATE public.properties 
SET status = CASE 
  WHEN status = 'available' THEN 'active'
  WHEN status = 'conditionally_sold' THEN 'under_contract'
  WHEN status = 'needs_changes' THEN 'active'
  WHEN status = 'withdrawn' THEN 'active'
  ELSE status
END;

-- Now drop the old constraint and add the new one
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('active', 'under_contract', 'sold'));