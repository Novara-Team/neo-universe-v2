import { useState, useEffect } from 'react';
import { Check, Sparkles, Crown, Zap, ArrowRight, Star } from 'lucide-react';
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
        return <Sparkles className="w-8 h-8" />;
      case 'plus':
        return <Zap className="w-8 h-8" />;
      case 'pro':
        return <Crown className="w-8 h-8" />;
      default:
        return <Sparkles className="w-8 h-8" />;
    }
  };

  const getPlanGradient = (slug: string) => {
    switch (slug) {
      case 'free':
        return 'from-gray-600 via-gray-700 to-gray-800';
      case 'plus':
        return 'from-blue-600 via-blue-700 to-cyan-600';
      case 'pro':
        return 'from-amber-500 via-orange-600 to-red-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const isCurrentPlan = (slug: string) => {
    return userProfile?.subscription_plan === slug;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="mt-6 text-lg text-cyan-400 font-medium">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/0 to-slate-900/0"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-6">
              Choose Your Universe
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Unlock the full potential of AI with plans designed for creators, innovators, and explorers
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => {
              const isPopular = plan.slug === 'plus';
              const isPro = plan.slug === 'pro';

              return (
                <div
                  key={plan.id}
                  className={`relative bg-slate-800/50 backdrop-blur-sm border-2 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${
                    isPopular
                      ? 'shadow-2xl shadow-cyan-500/20 border-cyan-500 lg:scale-105'
                      : isPro
                      ? 'shadow-xl shadow-orange-500/10 border-orange-500'
                      : 'shadow-lg border-slate-700'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {isPopular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {isPro && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <Crown className="w-4 h-4 fill-current" />
                        BEST VALUE
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getPlanGradient(plan.slug)} text-white rounded-2xl mb-6 shadow-lg`}>
                      {getPlanIcon(plan.slug)}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">
                          ${plan.price_monthly}
                        </span>
                        <span className="text-lg text-slate-300">/month</span>
                      </div>
                      {plan.price_monthly > 0 && (
                        <p className="text-sm text-slate-400 mt-1">Billed monthly, cancel anytime</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSubscribe(plan.slug)}
                      disabled={checkoutLoading === plan.slug || isCurrentPlan(plan.slug)}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-8 flex items-center justify-center gap-2 ${
                        isCurrentPlan(plan.slug)
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : isPopular
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                          : isPro
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-slate-700 hover:bg-slate-600 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      {checkoutLoading === plan.slug ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : isCurrentPlan(plan.slug) ? (
                        'Current Plan'
                      ) : plan.slug === 'free' ? (
                        <>
                          Get Started <ArrowRight className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Upgrade Now <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <div className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            isPopular ? 'bg-cyan-500/20' : isPro ? 'bg-orange-500/20' : 'bg-slate-700'
                          }`}>
                            <Check className={`w-3.5 h-3.5 ${
                              isPopular ? 'text-cyan-400' : isPro ? 'text-orange-400' : 'text-slate-400'
                            }`} />
                          </div>
                          <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-8">
              <h2 className="text-3xl font-bold text-white text-center">Compare All Features</h2>
              <p className="text-cyan-100 text-center mt-2">Find the perfect plan for your needs</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b-2 border-slate-600">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-bold text-slate-300 uppercase tracking-wider">Feature</th>
                    <th className="px-6 py-5 text-center text-sm font-bold text-slate-300 uppercase">Explorer</th>
                    <th className="px-6 py-5 text-center text-sm font-bold text-cyan-400 uppercase bg-cyan-500/10">Creator</th>
                    <th className="px-6 py-5 text-center text-sm font-bold text-orange-400 uppercase bg-orange-500/10">Universe Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5 text-white font-medium">AI Tools Access</td>
                    <td className="px-6 py-5 text-center text-slate-300">100 tools</td>
                    <td className="px-6 py-5 text-center text-white font-semibold bg-cyan-500/10">Unlimited</td>
                    <td className="px-6 py-5 text-center text-white font-semibold bg-orange-500/10">Unlimited</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5 text-white font-medium">Favorite Tools</td>
                    <td className="px-6 py-5 text-center text-slate-300">3</td>
                    <td className="px-6 py-5 text-center text-white font-semibold bg-cyan-500/10">Unlimited</td>
                    <td className="px-6 py-5 text-center text-white font-semibold bg-orange-500/10">Unlimited</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5 text-white font-medium">Write Reviews</td>
                    <td className="px-6 py-5 text-center"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-cyan-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                    <td className="px-6 py-5 text-center bg-orange-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5 text-white font-medium">Tool Comparison</td>
                    <td className="px-6 py-5 text-center"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-cyan-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                    <td className="px-6 py-5 text-center bg-orange-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5 text-white font-medium">Submit New Tools</td>
                    <td className="px-6 py-5 text-center"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-cyan-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                    <td className="px-6 py-5 text-center bg-orange-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5 text-white font-medium">Analytics Dashboard</td>
                    <td className="px-6 py-5 text-center"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-cyan-500/10"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-orange-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5 text-white font-medium">AI Recommendations</td>
                    <td className="px-6 py-5 text-center"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-cyan-500/10"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-orange-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5 text-white font-medium">Priority Support</td>
                    <td className="px-6 py-5 text-center"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-cyan-500/10"><span className="text-red-500 text-xl">✗</span></td>
                    <td className="px-6 py-5 text-center bg-orange-500/10"><Check className="w-6 h-6 text-green-400 mx-auto" /></td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

          <div className="mt-16 text-center space-y-6">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-3">30-Day Money-Back Guarantee</h3>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Try any plan risk-free. If you're not completely satisfied, we'll refund your money within 30 days, no questions asked.
              </p>
            </div>
            <p className="text-slate-400">
              Have questions? <a href="/support" className="text-cyan-400 hover:text-cyan-300 font-semibold underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
