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

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "novara.team.company@gmail.com";

    if (!brevoApiKey) {
      throw new Error('Brevo API key not configured');
    }

    const emailData = {
      sender: {
        name: "AI Universe Contact Form",
        email: adminEmail
      },
      to: [
        {
          email: adminEmail,
          name: "AI Universe Support"
        }
      ],
      replyTo: {
        email: email,
        name: name
      },
      subject: `[${priority.toUpperCase()}] ${subject}`,
      htmlContent: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .field { margin-bottom: 20px; }
              .field-label { font-weight: bold; color: #06b6d4; margin-bottom: 5px; }
              .field-value { background: white; padding: 15px; border-radius: 5px; border-left: 3px solid #06b6d4; }
              .priority { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
              .priority-low { background: #d1fae5; color: #065f46; }
              .priority-normal { background: #dbeafe; color: #1e40af; }
              .priority-high { background: #fed7aa; color: #92400e; }
              .priority-urgent { background: #fecaca; color: #991b1b; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New Contact Form Submission</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">AI Universe Support</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="field-label">Priority:</div>
                  <div class="field-value">
                    <span class="priority priority-${priority}">${priority}</span>
                  </div>
                </div>
                <div class="field">
                  <div class="field-label">From:</div>
                  <div class="field-value">${name} (${email})</div>
                </div>
                <div class="field">
                  <div class="field-label">Subject:</div>
                  <div class="field-value">${subject}</div>
                </div>
                <div class="field">
                  <div class="field-label">Message:</div>
                  <div class="field-value">${message.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="footer">
                  <p>This message was sent via the AI Universe contact form.</p>
                  <p>Reply directly to this email to respond to ${name}.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      textContent: `
New Contact Form Submission

Priority: ${priority.toUpperCase()}
From: ${name} (${email})
Subject: ${subject}

Message:
${message}

---
This message was sent via the AI Universe contact form.
Reply directly to this email to respond to ${name}.
      `
    };

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(emailData)
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      console.error('Brevo API error:', errorText);
      throw new Error(`Failed to send email via Brevo: ${brevoResponse.statusText}`);
    }

    const brevoResult = await brevoResponse.json();
    console.log('Email sent successfully via Brevo:', brevoResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message sent successfully. We will respond within 24 hours.',
        messageId: brevoResult.messageId
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