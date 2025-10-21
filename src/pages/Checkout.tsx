import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, Check, Shield, ArrowLeft, Crown, Zap, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';

interface Plan {
  slug: string;
  name: string;
  price: number;
  features: string[];
  icon: any;
  gradient: string;
}

const plans: Record<string, Plan> = {
  plus: {
    slug: 'plus',
    name: 'Creator',
    price: 9.99,
    features: [
      'Unlimited AI Tools Access',
      'Unlimited Favorites',
      'Write Reviews',
      'Tool Comparison',
      'Submit New Tools',
      'Priority News Access'
    ],
    icon: Zap,
    gradient: 'from-blue-600 to-cyan-600'
  },
  pro: {
    slug: 'pro',
    name: 'Universe Master',
    price: 19.99,
    features: [
      'Everything in Creator',
      'Analytics Dashboard',
      'AI Recommendations',
      'Priority Support',
      'Advanced Comparisons',
      'Early Access to New Features'
    ],
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600'
  }
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const planSlug = searchParams.get('plan');
    if (planSlug && plans[planSlug]) {
      setPlan(plans[planSlug]);
      setBillingEmail(user.email || '');
    } else {
      navigate('/pricing');
    }
  }, [user, searchParams, navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? ' / ' + v.slice(2, 4) : '');
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setCardExpiry(formatted);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCardCvc(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cardNumber || !cardExpiry || !cardCvc || !cardName || !billingEmail) {
      setError('Please fill in all required fields');
      return;
    }

    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      setError('Please enter a valid card number');
      return;
    }

    const expiryParts = cardExpiry.split(' / ');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      setError('Please enter a valid expiry date (MM / YY)');
      return;
    }

    if (cardCvc.length < 3) {
      setError('Please enter a valid CVC');
      return;
    }

    setLoading(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('stripe-checkout', {
        body: { planSlug: plan?.slug },
      });

      if (invokeError) throw invokeError;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  const PlanIcon = plan.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Pricing
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                  <CreditCard className="w-6 h-6 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Secure Checkout</h1>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 font-semibold mb-1">Secure Payment Processing</p>
                  <p className="text-slate-400 text-sm">
                    Your payment information is encrypted and secure. We use Stripe for payment processing.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    required
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      placeholder="1234 5678 9012 3456"
                    />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      placeholder="MM / YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={handleCvcChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      placeholder="123"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Complete Payment ${plan.price}/mo
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-400 text-sm">256-bit SSL Encryption</span>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className={`bg-gradient-to-r ${plan.gradient} rounded-xl p-6 mb-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <PlanIcon className="w-8 h-8 text-white" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-white/90 text-sm">Premium Plan</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-white/90">/month</span>
                </div>
                <p className="text-white/80 text-sm">Billed monthly, cancel anytime</p>
              </div>

              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  What's Included
                </h3>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-6 space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">${plan.price}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tax</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between">
                  <span className="text-white font-bold text-lg">Total</span>
                  <span className="text-white font-bold text-lg">${plan.price}/mo</span>
                </div>
              </div>

              <div className="mt-6 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <p className="text-cyan-400 text-sm font-medium mb-2">30-Day Money-Back Guarantee</p>
                <p className="text-slate-400 text-xs">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
