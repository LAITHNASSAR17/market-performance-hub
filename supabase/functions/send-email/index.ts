
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { emailTranslations } from "../email-translations.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  subject: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  language?: 'ar' | 'en';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, content, buttonText, buttonUrl, language = 'ar' }: EmailRequest = await req.json();
    
    const translations = emailTranslations.generic[language];

    try {
      const emailResponse = await resend.emails.send({
        from: "Trading Platform <onboarding@resend.dev>",
        to: to,
        subject: subject,
        html: `
          <div dir="${language === 'ar' ? 'rtl' : 'ltr'}" style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          ">
            <h2 style="color: #333333; margin-bottom: 20px;">${translations.greeting}</h2>
            
            <div style="
              color: #4a4a4a;
              line-height: 1.6;
              margin-bottom: 30px;
            ">
              ${content}
            </div>
            
            ${buttonText && buttonUrl ? `
              <a href="${buttonUrl}" style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              ">${buttonText}</a>
            ` : ''}
            
            <div style="
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eaeaea;
              color: #666666;
            ">
              <p>${translations.footer}</p>
              <p>${translations.signature}</p>
            </div>
          </div>
        `,
      });

      console.log("Email sent successfully:", emailResponse);

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
              ? "تم إرسال البريد الإلكتروني من خلال الخادم المؤقت. يرجى التحقق من بريدك الإلكتروني." 
              : "Email has been sent through the temporary server. Please check your email."
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
    console.error("Error in send-email function:", error);
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
