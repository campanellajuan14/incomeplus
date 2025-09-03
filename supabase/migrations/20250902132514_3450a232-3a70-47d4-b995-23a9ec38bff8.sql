-- Phase 1: Database Schema Extensions for Admin Panel Support

-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'investor');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create brokerages table
CREATE TABLE public.brokerages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  status VARCHAR DEFAULT 'active',
  tier VARCHAR DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent_verifications table
CREATE TABLE public.agent_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brokerage_id UUID REFERENCES public.brokerages(id),
  license_number TEXT NOT NULL,
  license_document_url TEXT,
  verification_status VARCHAR DEFAULT 'pending',
  admin_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brokerage_id UUID REFERENCES public.brokerages(id),
  plan_type VARCHAR NOT NULL DEFAULT 'basic',
  status VARCHAR DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_actions table for audit logging
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action_type VARCHAR NOT NULL,
  target_type VARCHAR NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property_flags table
CREATE TABLE public.property_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  flagged_by UUID NOT NULL,
  reason VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending',
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_flags table
CREATE TABLE public.user_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flagged_by UUID NOT NULL,
  reason VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending',
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Extend existing tables with admin fields
ALTER TABLE public.user_profiles 
ADD COLUMN user_type VARCHAR DEFAULT 'investor',
ADD COLUMN account_status VARCHAR DEFAULT 'active',
ADD COLUMN admin_notes TEXT,
ADD COLUMN suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN suspended_by UUID;

ALTER TABLE public.properties 
ADD COLUMN approval_status VARCHAR DEFAULT 'pending',
ADD COLUMN admin_notes TEXT,
ADD COLUMN approved_by UUID,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN featured BOOLEAN DEFAULT false,
ADD COLUMN flagged BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
$$;

-- Create security definer function to check agent role
CREATE OR REPLACE FUNCTION public.is_agent(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'agent'
  );
$$;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_roles.user_id = $1 
  LIMIT 1;
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- RLS Policies for brokerages
CREATE POLICY "Brokerages are viewable by authenticated users" ON public.brokerages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage brokerages" ON public.brokerages
  FOR ALL USING (public.is_admin());

-- RLS Policies for agent_verifications
CREATE POLICY "Users can view their own verification" ON public.agent_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification" ON public.agent_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verifications" ON public.agent_verifications
  FOR ALL USING (public.is_admin());

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin());

-- RLS Policies for admin_actions
CREATE POLICY "Admins can view all admin actions" ON public.admin_actions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can create admin actions" ON public.admin_actions
  FOR INSERT WITH CHECK (public.is_admin() AND auth.uid() = admin_user_id);

-- RLS Policies for system_settings
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (public.is_admin());

-- RLS Policies for property_flags
CREATE POLICY "Users can create property flags" ON public.property_flags
  FOR INSERT WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Users can view flags they created" ON public.property_flags
  FOR SELECT USING (auth.uid() = flagged_by);

CREATE POLICY "Admins can manage all property flags" ON public.property_flags
  FOR ALL USING (public.is_admin());

-- RLS Policies for user_flags
CREATE POLICY "Admins can manage all user flags" ON public.user_flags
  FOR ALL USING (public.is_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brokerages_updated_at
  BEFORE UPDATE ON public.brokerages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_verifications_updated_at
  BEFORE UPDATE ON public.agent_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('pricing_tiers', '{"basic": {"price": 99, "features": ["5 listings", "Basic analytics"]}, "premium": {"price": 199, "features": ["Unlimited listings", "Advanced analytics", "Priority support"]}}', 'Pricing tier configuration'),
('app_settings', '{"maintenance_mode": false, "allow_new_registrations": true, "require_email_verification": true}', 'General application settings'),
('email_templates', '{"welcome": {"subject": "Welcome to IncomePlus", "body": "Welcome to our platform!"}, "approval": {"subject": "Agent Verification Approved", "body": "Your agent verification has been approved."}}', 'Email template configuration');

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_agent_verifications_user_id ON public.agent_verifications(user_id);
CREATE INDEX idx_agent_verifications_status ON public.agent_verifications(verification_status);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at);
CREATE INDEX idx_property_flags_property_id ON public.property_flags(property_id);
CREATE INDEX idx_user_flags_user_id ON public.user_flags(user_id);