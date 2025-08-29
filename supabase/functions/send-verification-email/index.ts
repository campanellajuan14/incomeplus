import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  newEmail: string;
  currentPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { newEmail, currentPassword }: VerificationEmailRequest = await req.json();

    // Get user from authenticated client
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("User error:", userError);
      throw new Error("User not authenticated");
    }

    // Create client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify current password by creating a temporary client and signing in
    const tempClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Try to sign in with the provided password to verify it's correct
    const { error: verifyError } = await tempClient.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    });

    if (verifyError) {
      console.error("Password verification failed:", verifyError);
      throw new Error("Invalid current password");
    }

    // Clean up the sessions
    await tempClient.auth.signOut();
    await userClient.auth.signOut();

    // Check rate limiting - max 3 requests per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentRequests, error: rateLimitError } = await supabaseAdmin
      .from("email_change_requests")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      throw new Error("Database error");
    }

    if (recentRequests && recentRequests.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many verification requests. Please wait before requesting another." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate secure 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Store verification request in database
    const { error: dbError } = await supabaseAdmin
      .from("email_change_requests")
      .insert({
        user_id: user.id,
        current_email: user.email!,
        new_email: newEmail,
        verification_code: verificationCode,
        expires_at: expiresAt,
        is_verified: false,
      });

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw new Error("Failed to create verification request");
    }

    // Send verification email via Resend
    const emailResponse = await resend.emails.send({
      from: "<noreply@incomeplusproperties.ca>",
      to: [newEmail],
      subject: "Email Verification Code - Income Plus Properties",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Email Verification</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Income Plus Properties</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1a202c; margin: 0 0 20px; font-size: 24px; font-weight: 600;">Verify Your New Email Address</h2>
                <p style="color: #4a5568; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                  You've requested to change your email address to <strong>${newEmail}</strong>. Please use the verification code below to confirm this change.
                </p>
                
                <!-- Verification Code -->
                <div style="background: #f7fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                  <p style="color: #4a5568; margin: 0 0 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Verification Code</p>
                  <div style="font-size: 36px; font-weight: 700; color: #2d3748; letter-spacing: 8px; font-family: 'Courier New', monospace;">${verificationCode}</div>
                </div>
                
                <div style="background: #fef5e7; border-left: 4px solid #ed8936; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #744210; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>⏰ Important:</strong> This verification code will expire in <strong>15 minutes</strong>. If you didn't request this email change, please ignore this email or contact support.
                  </p>
                </div>
                
                <p style="color: #4a5568; margin: 30px 0 0; font-size: 14px; line-height: 1.6;">
                  Enter this code in your Income Plus Properties account to complete the email change process.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; margin: 0; font-size: 14px;">
                  © 2024 Income Plus Properties. All rights reserved.
                </p>
                <p style="color: #a0aec0; margin: 10px 0 0; font-size: 12px;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    // Log activity
    await supabaseAdmin
      .from("user_activity")
      .insert({
        user_id: user.id,
        activity_type: "email_verification_sent",
        activity_data: {
          new_email: newEmail,
          verification_code_sent: true,
          expires_at: expiresAt
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent successfully",
        expiresAt: expiresAt 
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
    console.error("Error in send-verification-email function:", error);
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