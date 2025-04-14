
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { renderAsync } from "npm:@react-email/render@0.0.12"
import { VerificationEmail } from "./_templates/verification.tsx"
import { ResetPasswordEmail } from "./_templates/reset-password.tsx"

// Get the API key from environment variables
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
console.log("RESEND_API_KEY exists:", !!RESEND_API_KEY);

// Initialize Resend with the API key
const resend = new Resend(RESEND_API_KEY);

// Allow both the Lovable preview domain and trackmind.vip domain
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Allow all origins during development
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Edge function called, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received email request');
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    const requestData = JSON.parse(requestBody);
    const { type, email, verificationLink, resetLink } = requestData;
    
    console.log('Email request data:', { 
      type, 
      email, 
      hasVerificationLink: !!verificationLink, 
      hasResetLink: !!resetLink 
    });

    if (!email) {
      console.error('Missing email in request');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let html = '';
    let subject = '';
    const fromEmail = "noreply@trackmind.vip"; // Use trackmind.vip domain

    if (type === 'verification') {
      console.log('Rendering verification email for:', email);
      if (!verificationLink) {
        console.error('Missing verification link');
        return new Response(
          JSON.stringify({ error: 'Verification link is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      html = await renderAsync(VerificationEmail({ email, verificationLink }));
      subject = 'تأكيد البريد الإلكتروني';
    } else if (type === 'reset-password') {
      console.log('Rendering reset password email for:', email);
      if (!resetLink) {
        console.error('Missing reset link');
        return new Response(
          JSON.stringify({ error: 'Reset link is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      html = await renderAsync(ResetPasswordEmail({ email, resetLink }));
      subject = 'إعادة تعيين كلمة المرور';
    } else {
      console.error('Invalid email type:', type);
      return new Response(
        JSON.stringify({ error: 'Invalid email type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Email prepared for:', email);
    console.log('Email subject:', subject);
    console.log('HTML length:', html?.length || 0);
    
    if (!html) {
      console.error('Failed to generate HTML content');
      return new Response(
        JSON.stringify({ error: 'Failed to generate email content' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send the email using Resend
    try {
      const emailResponse = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: subject,
        html: html
      });

      console.log('Email sent successfully:', emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully",
          data: emailResponse
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (sendError) {
      console.error('Error sending email:', sendError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email",
          details: sendError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
