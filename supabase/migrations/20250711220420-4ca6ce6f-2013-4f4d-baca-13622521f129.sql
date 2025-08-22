-- First, change the default value for the status column
ALTER TABLE public.properties 
ALTER COLUMN status SET DEFAULT 'active';

-- Update all existing records to use the new status values
UPDATE public.properties 
SET status = 'active' 
WHERE status IS NULL OR status NOT IN ('active', 'under_contract', 'sold');

-- Drop the existing check constraint and add the new one
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('active', 'under_contract', 'sold'));