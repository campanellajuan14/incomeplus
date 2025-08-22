-- First, update all existing records to use the new status values
UPDATE public.properties 
SET status = 'active' 
WHERE status IN ('available', 'needs_changes', 'withdrawn');

UPDATE public.properties 
SET status = 'under_contract' 
WHERE status = 'conditionally_sold';

-- Now update the constraint to use the new status values
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('active', 'under_contract', 'sold'));