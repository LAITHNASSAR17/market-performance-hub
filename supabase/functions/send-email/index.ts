
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { renderAsync } from "npm:@react-email/render@0.0.12"
import { VerificationEmail } from "./_templates/verification.tsx"
import { ResetPasswordEmail } from "./_templates/reset-password.tsx"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received email request')
    const { type, email, verificationLink, resetLink } = await req.json()
    console.log('Email request data:', { type, email, hasVerificationLink: !!verificationLink, hasResetLink: !!resetLink })

    let html = ''
    let subject = ''

    if (type === 'verification') {
      html = await renderAsync(VerificationEmail({ email, verificationLink }))
      subject = 'تأكيد البريد الإلكتروني'
      console.log('Rendering verification email for:', email)
    } else if (type === 'reset-password') {
      html = await renderAsync(ResetPasswordEmail({ email, resetLink }))
      subject = 'إعادة تعيين كلمة المرور'
      console.log('Rendering reset password email for:', email)
    } else {
      throw new Error('Invalid email type')
    }

    console.log('Sending email to:', email)
    const { data, error } = await resend.emails.send({
      from: 'Trading Platform <onboarding@resend.dev>',
      to: email,
      subject,
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    console.log('Email sent successfully:', data)
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
