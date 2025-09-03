import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailChangeRequest {
  newEmail: string;
  password: string;
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

    const { newEmail, password }: EmailChangeRequest = await req.json();

    if (!newEmail || !password) {
      throw new Error('New email and password are required');
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    });

    if (signInError) {
      throw new Error('Invalid password');
    }

    // Note: We'll check for email uniqueness during the actual update process
    // to avoid using admin-only methods in edge functions

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store verification request in database
    const { error: insertError } = await supabase
      .from('email_change_requests')
      .upsert({
        user_id: user.id,
        current_email: user.email!,
        new_email: newEmail,
        verification_code: verificationCode,
        expires_at: expiresAt.toISOString(),
        is_verified: false
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to create verification request');
    }

    // Send verification email to CURRENT email address
    const emailResponse = await resend.emails.send({
      from: "Property App <noreply@incomeplusproperties.ca>",
      to: [user.email!], // Send to CURRENT email
      subject: "Email Change Verification Code",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333; text-align: center;">Email Change Verification</h1>
          <p>You have requested to change your email address to <strong>${newEmail}</strong>.</p>
          <p>To confirm this change, please enter the following verification code:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${verificationCode}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this change, please ignore this email.</p>
        </div>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent to your current email address" 
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