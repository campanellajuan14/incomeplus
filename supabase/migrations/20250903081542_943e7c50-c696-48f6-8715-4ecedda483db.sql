-- Create comprehensive property listing functions that return all necessary fields
-- Replace existing functions with complete ones

-- Function for authenticated users (returns all fields including agent contact)
CREATE OR REPLACE FUNCTION public.get_complete_property_listings()
RETURNS TABLE(
  id uuid, 
  property_title text, 
  address text, 
  city text, 
  province text, 
  postal_code text, 
  property_description text, 
  number_of_units integer, 
  income_type text, 
  tenancy_type text, 
  agent_name text, 
  agent_email text, 
  agent_phone text, 
  images jsonb, 
  latitude numeric, 
  longitude numeric, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  featured boolean, 
  units jsonb,
  purchase_price numeric,
  property_taxes numeric,
  insurance numeric,
  hydro numeric,
  gas numeric,
  water numeric,
  waste_management numeric,
  maintenance numeric,
  management_fees numeric,
  miscellaneous numeric,
  down_payment_type text,
  down_payment_amount numeric,
  amortization_period integer,
  mortgage_rate numeric,
  status text,
  user_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.property_title,
    p.address,
    p.city,
    p.province,
    p.postal_code,
    p.property_description,
    p.number_of_units,
    p.income_type,
    p.tenancy_type,
    p.agent_name,
    p.agent_email,
    p.agent_phone,
    p.images,
    p.latitude,
    p.longitude,
    p.created_at,
    p.updated_at,
    p.featured,
    p.units,
    p.purchase_price,
    p.property_taxes,
    p.insurance,
    p.hydro,
    p.gas,
    p.water,
    p.waste_management,
    p.maintenance,
    p.management_fees,
    p.miscellaneous,
    p.down_payment_type,
    p.down_payment_amount,
    p.amortization_period,
    p.mortgage_rate,
    p.status,
    p.user_id
  FROM properties p
  WHERE p.approval_status = 'approved' 
    AND p.status = 'active' 
    AND p.flagged = false
    AND auth.uid() IS NOT NULL -- Only authenticated users
  ORDER BY p.featured DESC, p.created_at DESC;
$$;

-- Function for public access (returns all fields except agent contact info)
CREATE OR REPLACE FUNCTION public.get_public_complete_property_listings()
RETURNS TABLE(
  id uuid, 
  property_title text, 
  address text, 
  city text, 
  province text, 
  postal_code text, 
  property_description text, 
  number_of_units integer, 
  income_type text, 
  tenancy_type text, 
  images jsonb, 
  latitude numeric, 
  longitude numeric, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  featured boolean, 
  units jsonb,
  purchase_price numeric,
  property_taxes numeric,
  insurance numeric,
  hydro numeric,
  gas numeric,
  water numeric,
  waste_management numeric,
  maintenance numeric,
  management_fees numeric,
  miscellaneous numeric,
  down_payment_type text,
  down_payment_amount numeric,
  amortization_period integer,
  mortgage_rate numeric,
  status text,
  user_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.property_title,
    p.address,
    p.city,
    p.province,
    p.postal_code,
    p.property_description,
    p.number_of_units,
    p.income_type,
    p.tenancy_type,
    p.images,
    p.latitude,
    p.longitude,
    p.created_at,
    p.updated_at,
    p.featured,
    p.units,
    p.purchase_price,
    p.property_taxes,
    p.insurance,
    p.hydro,
    p.gas,
    p.water,
    p.waste_management,
    p.maintenance,
    p.management_fees,
    p.miscellaneous,
    p.down_payment_type,
    p.down_payment_amount,
    p.amortization_period,
    p.mortgage_rate,
    p.status,
    p.user_id
  FROM properties p
  WHERE p.approval_status = 'approved' 
    AND p.status = 'active' 
    AND p.flagged = false
  ORDER BY p.featured DESC, p.created_at DESC;
$$;