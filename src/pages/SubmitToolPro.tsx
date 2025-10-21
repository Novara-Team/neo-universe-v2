import { useState, useEffect } from 'react';
import { CheckCircle, Upload, Sparkles, Zap, Target, Star } from 'lucide-react';
import { supabase, Category } from '../lib/supabase';

export default function SubmitToolPro() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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

    const { error } = await supabase.from('tool_submissions').insert([formData]);

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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-16 text-center shadow-2xl shadow-cyan-500/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-6 shadow-lg shadow-cyan-500/50">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Submission Received!
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Thank you for being a Pro member and contributing to our community. Your AI tool submission will be reviewed with priority and published soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-semibold"
                >
                  Submit Another Tool
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full px-6 py-3 mb-6">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-cyan-400 text-sm font-semibold">PRO MEMBER EXCLUSIVE</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent leading-tight">
            Submit Your AI Tool
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
            As a Pro member, your submissions receive priority review and faster publishing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Priority Review</h3>
            <p className="text-slate-400 text-sm">Your submissions are reviewed first by our team</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Featured Placement</h3>
            <p className="text-slate-400 text-sm">Higher chance of being featured on homepage</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Enhanced Listing</h3>
            <p className="text-slate-400 text-sm">Pro badge and premium presentation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-200 mb-3">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                  Tool Name <span className="text-cyan-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="e.g., ChatGPT, Midjourney"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-200 mb-3">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                  Category <span className="text-cyan-400 ml-1">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-200 mb-3">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                Description <span className="text-cyan-400 ml-1">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-5 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe what this AI tool does and its key features..."
              />
              <p className="text-slate-400 text-xs mt-2">Be detailed and highlight what makes this tool unique</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-200 mb-3">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span>
                  Website URL <span className="text-cyan-400 ml-1">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-200 mb-3">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">5</span>
                  Logo URL
                </label>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-200 mb-3">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">6</span>
                  Pricing Type <span className="text-cyan-400 ml-1">*</span>
                </label>
                <select
                  required
                  value={formData.pricing_type}
                  onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                >
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Trial">Trial</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-200 mb-3">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">7</span>
                  Your Email <span className="text-cyan-400 ml-1">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.submitter_email}
                  onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
                <div className="mt-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="font-semibold text-cyan-400">Why do we need your email?</span> We use it to notify you about your submission status and to contact you if we need clarification about your tool. Your email is never shared with third parties or used for marketing without your consent.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>{loading ? 'Submitting...' : 'Submit Tool for Priority Review'}</span>
              </button>
              <p className="text-center text-slate-400 text-sm mt-4">
                Your submission will be reviewed within 24-48 hours
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
