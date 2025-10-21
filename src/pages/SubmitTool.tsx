import { useState, useEffect } from 'react';
import { Send, CheckCircle, HelpCircle, X } from 'lucide-react';
import { supabase, Category } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import SubmitToolPro from './SubmitToolPro';

export default function SubmitTool() {
  const { profile, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    website_url: '',
    logo_url: '',
    pricing_type: 'Free',
    submitter_email: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const submissionData = {
      ...formData,
      user_id: user?.id || null
    };

    const { error } = await supabase.from('tool_submissions').insert([submissionData]);

    setLoading(false);

    if (!error) {
      setSubmitted(true);
      setFormData({
        name: '',
        category: '',
        description: '',
        website_url: '',
        logo_url: '',
        pricing_type: 'Free',
        submitter_email: '',
      });
    }
  };

  if (profile && (profile.subscription_plan === 'plus' || profile.subscription_plan === 'pro')) {
    return <SubmitToolPro />;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
            <p className="text-slate-300 mb-8">
              Your AI tool submission has been received. Our team will review it and publish it soon.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
            >
              Submit Another Tool
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Submit an AI Tool</h1>
          <p className="text-slate-400 text-lg">
            Know an amazing AI tool? Share it with our community!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tool Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., ChatGPT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Describe what this AI tool does..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Website URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL (optional)</label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Pricing Type <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.pricing_type}
                onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
                <option value="Trial">Trial</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Your Email <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmailInfo(true)}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="underline">Why My Email?</span>
                </button>
              </div>
              <input
                type="email"
                required
                value={formData.submitter_email}
                onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? 'Submitting...' : 'Submit Tool'}</span>
            </button>
          </div>
        </form>

        {showEmailInfo && (
          <>
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setShowEmailInfo(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <HelpCircle className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Why We Need Your Email</h3>
                  </div>
                  <button
                    onClick={() => setShowEmailInfo(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 text-slate-300">
                  <p className="leading-relaxed">
                    We require your email address for the following important reasons:
                  </p>

                  <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan-400 text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Status Updates</h4>
                        <p className="text-sm text-slate-400">
                          We'll notify you when your submission is reviewed and published on our platform.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan-400 text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Verification</h4>
                        <p className="text-sm text-slate-400">
                          Your email helps us verify the authenticity of submissions and prevent spam.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan-400 text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Communication</h4>
                        <p className="text-sm text-slate-400">
                          We may need to contact you if we have questions or need additional information about the tool.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <p className="text-sm text-cyan-400">
                      <strong>Privacy Promise:</strong> Your email is kept private and will never be shared with third parties or used for marketing without your consent.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowEmailInfo(false)}
                  className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 font-medium"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
