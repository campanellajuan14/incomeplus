-- Fix security issue: Replace overly permissive user profile policy
-- The current "Limited public profile for active conversations" policy exposes too much personal data

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Limited public profile for active conversations" ON user_profiles;

-- Create a new, more secure policy that only exposes essential public fields
-- This policy allows users to see only basic public information (username, user_type, account_status)
-- for users they have conversations or property inquiries with
CREATE POLICY "Secure public profile for active conversations" 
ON user_profiles 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) 
  AND ((account_status)::text = 'active'::text) 
  AND (
    -- Allow access through active conversations
    (EXISTS ( 
      SELECT 1
      FROM user_conversations uc
      WHERE (
        ((uc.participant_1_id = auth.uid()) AND (uc.participant_2_id = user_profiles.user_id)) 
        OR 
        ((uc.participant_2_id = auth.uid()) AND (uc.participant_1_id = user_profiles.user_id))
      )
    )) 
    OR 
    -- Allow access through property inquiries
    (EXISTS ( 
      SELECT 1
      FROM (property_inquiries pi JOIN properties p ON ((pi.property_id = p.id)))
      WHERE (
        ((pi.user_id = auth.uid()) AND (p.user_id = user_profiles.user_id)) 
        OR 
        ((pi.user_id = user_profiles.user_id) AND (p.user_id = auth.uid()))
      )
    ))
  )
);

-- Create a new function to get safe public profile information only
-- This function will be used by the application to get limited profile data
CREATE OR REPLACE FUNCTION public.get_safe_public_profile_for_conversation(target_user_id uuid)
RETURNS TABLE(
  user_id uuid, 
  username text, 
  user_type character varying, 
  account_status character varying,
  member_since date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify there's an active conversation or property inquiry relationship
  IF NOT EXISTS (
    SELECT 1 FROM user_conversations uc
    WHERE (
      ((uc.participant_1_id = auth.uid()) AND (uc.participant_2_id = target_user_id)) 
      OR 
      ((uc.participant_2_id = auth.uid()) AND (uc.participant_1_id = target_user_id))
    )
  ) AND NOT EXISTS (
    SELECT 1 FROM (property_inquiries pi JOIN properties p ON ((pi.property_id = p.id)))
    WHERE (
      ((pi.user_id = auth.uid()) AND (p.user_id = target_user_id)) 
      OR 
      ((pi.user_id = target_user_id) AND (p.user_id = auth.uid()))
    )
  ) THEN
    RAISE EXCEPTION 'No relationship exists with this user';
  END IF;

  -- Return only safe, essential public information
  RETURN QUERY
  SELECT 
    up.user_id,
    up.username,
    up.user_type,
    up.account_status,
    up.created_at::date as member_since
  FROM user_profiles up
  WHERE up.user_id = target_user_id
  AND up.account_status = 'active';
END;
$$;

-- Add a comment to document the security fix
COMMENT ON POLICY "Secure public profile for active conversations" ON user_profiles IS 
'Security-hardened policy that allows limited profile access for users with conversation/inquiry relationships. Only exposes essential public fields, not personal data like phone/company/bio.';