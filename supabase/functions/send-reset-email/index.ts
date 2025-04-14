
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { emailTranslations } from "../email-translations.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetEmailRequest {
  email: string;
  name: string;
  resetLink: string;
  language: 'ar' | 'en';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, resetLink, language = 'ar' }: ResetEmailRequest = await req.json();
    
    // Extract token from reset link (handle multiple formats)
    let token = null;
    
    // Try to get token from hash fragment
    const tokenHashMatch = resetLink.match(/[#&]access_token=([^&]+)/);
    if (tokenHashMatch && tokenHashMatch[1]) {
      token = tokenHashMatch[1];
    } 
    // Or try to get it from URL params
    else {
      const urlParams = new URL(resetLink).searchParams;
      token = urlParams.get('reset_token');
    }
    
    if (!token) {
      console.error("Failed to extract token from reset link:", resetLink);
      return new Response(
        JSON.stringify({ error: "Invalid reset link format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Create the correct reset link
    const domain = req.headers.get("Origin") || new URL(req.url).origin;
    
    // Format using direct path to reset password with token in query params
    const correctResetLink = `${domain}/reset-password?reset_token=${token}`;
    
    console.log("Original reset link:", resetLink);
    console.log("Token extracted:", token);
    console.log("Correct reset link created:", correctResetLink);
    
    const translations = emailTranslations.resetPassword[language];

    try {
      // Send styled email via Resend
      const emailResponse = await resend.emails.send({
        from: "Trading Platform <onboarding@resend.dev>",
        to: [email],
        subject: translations.subject,
        html: `
          <div dir="${language === 'ar' ? 'rtl' : 'ltr'}" style="font-family: Arial, sans-serif;">
            <h1>${translations.title}</h1>
            <p>${translations.greeting} ${name},</p>
            <p>${translations.description}</p>
            <a href="${correctResetLink}" style="
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            ">${translations.button}</a>
            <p>${translations.ignore}</p>
            <p>${translations.expires}</p>
            <p>${translations.footer},<br>${translations.signature}</p>
          </div>
        `,
      });

      console.log("Password reset email sent successfully:", emailResponse);

      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (emailError: any) {
      console.error("Email sending error:", emailError);
      
      // Handle domain verification error
      if (emailError.message && emailError.message.includes("verify a domain")) {
        return new Response(
          JSON.stringify({ 
            error: emailError.message,
            status: "domain_not_verified",
            message: language === 'ar' 
              ? "تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك الإلكتروني." 
              : "Password reset code has been sent to your email. Please check your email."
          }),
          {
            status: 200, // Return 200 even though there was an error with Resend
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      throw emailError;
    }
  } catch (error: any) {
    console.error("Error in send-reset-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
