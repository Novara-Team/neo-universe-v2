import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, source = "website" } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existing } = await supabase
      .from("newsletter_subscriptions")
      .select("id, is_active")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ success: false, error: "Email already subscribed" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        const { error } = await supabase
          .from("newsletter_subscriptions")
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq("id", existing.id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: "Successfully resubscribed!" }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    const { error } = await supabase
      .from("newsletter_subscriptions")
      .insert({ email, source });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "Successfully subscribed to newsletter!" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to subscribe" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
