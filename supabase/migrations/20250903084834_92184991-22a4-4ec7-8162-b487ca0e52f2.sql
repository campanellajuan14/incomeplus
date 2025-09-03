-- CRITICAL SECURITY FIX: Remove remaining vulnerability in user_profiles access
-- The current policy still exposes ALL columns to conversation participants

-- Remove the still-vulnerable policy that allows broad SELECT access
DROP POLICY IF EXISTS "Secure public profile for active conversations" ON user_profiles;

-- Create a completely secure function that returns ONLY the absolute minimum needed for messaging
CREATE OR REPLACE FUNCTION public.get_minimal_user_info_for_messaging(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  username text,
  user_type character varying
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify relationship exists (conversation or property inquiry)
  IF NOT EXISTS (
    SELECT 1 FROM user_conversations uc
    WHERE (
      ((uc.participant_1_id = auth.uid()) AND (uc.participant_2_id = target_user_id)) 
      OR 
      ((uc.participant_2_id = auth.uid()) AND (uc.participant_1_id = target_user_id))
    )
  ) AND NOT EXISTS (
    SELECT 1 FROM property_inquiries pi 
    JOIN properties p ON pi.property_id = p.id
    WHERE (
      ((pi.user_id = auth.uid()) AND (p.user_id = target_user_id)) 
      OR 
      ((pi.user_id = target_user_id) AND (p.user_id = auth.uid()))
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: No conversation or inquiry relationship exists';
  END IF;

  -- Return ONLY essential messaging info - NO personal data
  RETURN QUERY
  SELECT 
    up.user_id,
    up.username,
    up.user_type
  FROM user_profiles up
  WHERE up.user_id = target_user_id
    AND up.account_status = 'active';
END;
$$;

-- Add restrictive comment
COMMENT ON FUNCTION public.get_minimal_user_info_for_messaging(uuid) IS 
'SECURITY: Returns only username and user_type for messaging. NO personal data (phone, company, bio, admin_notes) exposed.';

-- Verify no policies allow cross-user profile access except own profile
-- The remaining policies should only be:
-- 1. Users can view/manage their own complete profile
-- 2. No cross-user access to sensitive fields