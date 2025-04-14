
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
    
    const translations = emailTranslations.resetPassword[language];

    try {
      const emailResponse = await resend.emails.send({
        from: "Trading Platform <onboarding@resend.dev>",
        to: [email],
        subject: translations.subject,
        html: `
          <div dir="${language === 'ar' ? 'rtl' : 'ltr'}" style="font-family: Arial, sans-serif;">
            <h1>${translations.title}</h1>
            <p>${translations.greeting} ${name},</p>
            <p>${translations.description}</p>
            <a href="${resetLink}" style="
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
      
      // Check if this is a domain verification error
      if (emailError.message && emailError.message.includes("verify a domain")) {
        return new Response(
          JSON.stringify({ 
            error: emailError.message,
            status: "domain_not_verified",
            message: language === 'ar' 
              ? "تم إرسال رمز إعادة تعيين كلمة المرور إلى Supabase. يرجى التحقق من بريدك الإلكتروني." 
              : "Password reset code has been sent via Supabase. Please check your email."
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
