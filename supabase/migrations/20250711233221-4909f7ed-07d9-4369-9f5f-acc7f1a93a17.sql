-- Update the default value for status column
ALTER TABLE public.properties 
ALTER COLUMN status SET DEFAULT 'active';