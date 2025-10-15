import { useState, useEffect } from 'react';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  stripe_price_id: string | null;
  features: string[];
  limits: Record<string, any>;
}

export default function Pricing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadPlans();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setUserProfile(data);
    }
  };

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planSlug: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (planSlug === 'free') {
      return;
    }

    setCheckoutLoading(planSlug);

    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { planSlug },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free':
        return <Sparkles className="w-6 h-6" />;
      case 'plus':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'free':
        return 'from-slate-500 to-slate-600';
      case 'plus':
        return 'from-blue-500 to-blue-600';
      case 'pro':
        return 'from-amber-500 to-amber-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getPlanBadge = (slug: string) => {
    if (slug === 'plus') {
      return (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
            MOST POPULAR
          </span>
        </div>
      );
    }
    return null;
  };

  const isCurrentPlan = (slug: string) => {
    return userProfile?.subscription_plan === slug;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Unlock the full potential of AI Universe with a plan that fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all hover:shadow-2xl ${
                plan.slug === 'plus' ? 'border-blue-500 scale-105' : 'border-slate-200'
              }`}
            >
              {getPlanBadge(plan.slug)}

              <div className="p-8">
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getPlanColor(plan.slug)} text-white rounded-xl mb-4`}>
                  {getPlanIcon(plan.slug)}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900">
                    ${plan.price_monthly}
                  </span>
                  <span className="text-slate-600 ml-2">/month</span>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.slug)}
                  disabled={checkoutLoading === plan.slug || isCurrentPlan(plan.slug)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                    isCurrentPlan(plan.slug)
                      ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                      : plan.slug === 'plus'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30'
                      : plan.slug === 'pro'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {checkoutLoading === plan.slug
                    ? 'Processing...'
                    : isCurrentPlan(plan.slug)
                    ? 'Current Plan'
                    : plan.slug === 'free'
                    ? 'Get Started'
                    : 'Upgrade Now'}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Compare Plans</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Explorer</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Creator</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Universe Master</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-8 py-4 text-slate-700">AI Tools Access</td>
                  <td className="px-6 py-4 text-center text-slate-600">100 tools</td>
                  <td className="px-6 py-4 text-center text-slate-600">Unlimited</td>
                  <td className="px-6 py-4 text-center text-slate-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-8 py-4 text-slate-700">Favorite Tools</td>
                  <td className="px-6 py-4 text-center text-slate-600">3</td>
                  <td className="px-6 py-4 text-center text-slate-600">Unlimited</td>
                  <td className="px-6 py-4 text-center text-slate-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-8 py-4 text-slate-700">Write Reviews</td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="px-8 py-4 text-slate-700">Tool Comparison</td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="px-8 py-4 text-slate-700">Submit New Tools</td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="px-8 py-4 text-slate-700">Analytics Dashboard</td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="px-8 py-4 text-slate-700">AI Recommendations</td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="px-8 py-4 text-slate-700">Priority Support</td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-red-500">✗</span></td>
                  <td className="px-6 py-4 text-center text-green-500">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">All plans include a 30-day money-back guarantee</p>
          <p className="text-sm text-slate-500">Need help choosing? Contact our support team</p>
        </div>
      </div>
    </div>
  );
}
