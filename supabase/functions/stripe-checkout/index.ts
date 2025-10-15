import Stripe from 'npm:stripe@17.7.0';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-12-18.acacia',
});

const allowedOrigin = 'https://neo-universe.vercel.app';

function corsResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

Deno.serve(async (req: Request) => {
  try {
    // Preflight handling
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return corsResponse({ error: 'Missing authorization' }, 401);

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) return corsResponse({ error: 'Unauthorized' }, 401);

    const { planSlug } = await req.json();
    const PRICE_IDS: Record<string, string> = {
      plus: 'price_1SHgo2HRZQr8tNjmV75zImkN',
      pro: 'price_1SHgs0HRZQr8tNjmONsFNpTZ',
    };

    if (!planSlug || !PRICE_IDS[planSlug]) return corsResponse({ error: 'Invalid plan' }, 400);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[planSlug], quantity: 1 }],
      mode: 'subscription',
      success_url: `${allowedOrigin}/pricing?success=true`,
      cancel_url: `${allowedOrigin}/pricing?canceled=true`,
      metadata: { user_id: user.id, plan_slug: planSlug },
    });

    return corsResponse({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return corsResponse({ error: err.message }, 500);
  }
});
