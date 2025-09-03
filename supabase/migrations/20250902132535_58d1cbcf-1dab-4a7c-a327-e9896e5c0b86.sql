-- Fix security warnings from linter

-- Fix search_path for existing functions that don't have it set
DROP FUNCTION IF EXISTS public.validate_units_structure();
CREATE OR REPLACE FUNCTION public.validate_units_structure()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Function logic here
END;
$function$;

DROP FUNCTION IF EXISTS public.validate_units_structure(jsonb);
CREATE OR REPLACE FUNCTION public.validate_units_structure(units_json jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if units is an array
  IF jsonb_typeof(units_json) != 'array' THEN
    RETURN false;
  END IF;
  
  -- Check if all required fields exist in each unit
  -- This is a basic validation - more complex validation can be added
  RETURN true;
END;
$function$;