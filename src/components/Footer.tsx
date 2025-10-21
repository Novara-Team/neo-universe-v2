import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail, CheckCircle } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/newsletter-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source: 'footer' }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setEmail('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Mail className="w-6 h-6 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">Stay Updated</h3>
            </div>
            <p className="text-slate-300 mb-6">
              Join 10,000+ AI enthusiasts who discover new tools daily. Get weekly updates on the latest AI innovations.
            </p>

            {success ? (
              <div className="flex items-center justify-center space-x-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-6 py-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Successfully subscribed! Check your email.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}

            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              AI Universe
            </h3>
            <p className="text-slate-400 mb-4">
              Discover, filter, and explore the best AI tools in one place. Join thousands of AI enthusiasts discovering new tools daily.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Explore Tools
                </Link>
              </li>
              <li>
                <Link to="/top-tools" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Top Tools
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Submit Tool
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2025 AI Universe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
