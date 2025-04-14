
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  name: string;
  verificationLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, verificationLink }: VerificationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Lovable <onboarding@yourdomain.com>",
      to: [email],
      subject: "تحقق من حسابك",
      html: `
        <div dir="rtl">
          <h1>مرحباً ${name}!</h1>
          <p>شكراً لتسجيلك. الرجاء التحقق من بريدك الإلكتروني بالنقر على الرابط أدناه:</p>
          <a href="${verificationLink}">تحقق من البريد الإلكتروني</a>
          <p>إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>
        </div>
      `,
    });

    console.log("تم إرسال البريد الإلكتروني بنجاح:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("خطأ في وظيفة إرسال التحقق من البريد الإلكتروني:", error);
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
