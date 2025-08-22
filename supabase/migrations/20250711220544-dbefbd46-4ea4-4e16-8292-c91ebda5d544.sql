-- Update all 'available' status to 'active'
UPDATE public.properties SET status = 'active' WHERE status = 'available';

-- Now apply the constraint
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('active', 'under_contract', 'sold'));

-- Update the default value
ALTER TABLE public.properties 
ALTER COLUMN status SET DEFAULT 'active';