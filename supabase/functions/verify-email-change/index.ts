import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  verificationCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { verificationCode }: VerifyEmailRequest = await req.json();

    if (!verificationCode) {
      throw new Error('Verification code is required');
    }

    // Find the verification request
    const { data: emailChangeRequest, error: fetchError } = await supabase
      .from('email_change_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('verification_code', verificationCode)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !emailChangeRequest) {
      throw new Error('Invalid or expired verification code');
    }

    // Update user's email in auth.users
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        email: emailChangeRequest.new_email,
        email_confirm: true
      }
    );

    if (updateAuthError) {
      console.error('Auth update error:', updateAuthError);
      throw new Error('Failed to update email in authentication system');
    }

    // Mark the request as verified
    const { error: markVerifiedError } = await supabase
      .from('email_change_requests')
      .update({ 
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', emailChangeRequest.id);

    if (markVerifiedError) {
      console.error('Database update error:', markVerifiedError);
      // Continue anyway as the main update succeeded
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email successfully updated",
        newEmail: emailChangeRequest.new_email
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-email-change function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);