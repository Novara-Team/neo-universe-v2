import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { name, email, subject, message, priority }: ContactRequest = await req.json();

    const emailContent = `
New Contact Form Submission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From: ${name}
Email: ${email}
Priority: ${priority.toUpperCase()}

Subject: ${subject}

Message:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted at: ${new Date().toLocaleString()}
    `.trim();

    console.log('Contact form submission:', {
      from: email,
      name,
      subject,
      priority,
      timestamp: new Date().toISOString()
    });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AI Universe Support <support@aiuniverse.app>',
        to: ['novara.team.company@gmail.com'],
        reply_to: email,
        subject: `[${priority.toUpperCase()}] ${subject}`,
        text: emailContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error('Failed to send email');
    }

    const result = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message sent successfully',
        emailId: result.id
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send message'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
