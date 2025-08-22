-- Add status field to properties table
ALTER TABLE public.properties 
ADD COLUMN status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'conditionally_sold', 'needs_changes', 'withdrawn'));

-- Add updated_at trigger for status changes
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();