-- Update the status field check constraint to use the new status values
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('active', 'under_contract', 'sold'));

-- Update existing records to use the new status values
UPDATE public.properties 
SET status = 'active' 
WHERE status = 'available' OR status = 'needs_changes' OR status = 'withdrawn';

UPDATE public.properties 
SET status = 'under_contract' 
WHERE status = 'conditionally_sold';