import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  verificationCode: string;
  newEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a client for user operations
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    userClient.auth.setSession({
      access_token: authHeader.replace("Bearer ", ""),
      refresh_token: "",
    });

    const { verificationCode, newEmail }: VerifyEmailRequest = await req.json();

    // Get current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Find valid verification request
    const { data: verificationRequest, error: findError } = await supabaseClient
      .from("email_change_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("new_email", newEmail)
      .eq("verification_code", verificationCode)
      .eq("is_verified", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (findError || !verificationRequest) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update email in Supabase Auth using service role key
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      { email: newEmail }
    );

    if (updateError) {
      console.error("Error updating user email:", updateError);
      throw new Error("Failed to update email address");
    }

    // Mark verification request as verified
    const { error: markVerifiedError } = await supabaseClient
      .from("email_change_requests")
      .update({ is_verified: true })
      .eq("id", verificationRequest.id);

    if (markVerifiedError) {
      console.error("Error marking verification as complete:", markVerifiedError);
    }

    // Log activity
    await supabaseClient
      .from("user_activity")
      .insert({
        user_id: user.id,
        activity_type: "email_changed",
        activity_data: {
          old_email: verificationRequest.current_email,
          new_email: newEmail,
          verified_at: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email address updated successfully",
        newEmail: newEmail
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
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);