import { Sparkles, Target, Users, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">About Us</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to AI Universe
          </h1>
          <p className="text-xl text-slate-300">
            Your gateway to discovering the most powerful AI tools on the internet
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            AI Universe was built to make discovering powerful AI tools simple, fast, and fun. In a world where
            new AI technologies emerge daily, we recognized the need for a centralized platform where users can
            explore, compare, and find the perfect AI tools for their specific needs.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Whether you're a content creator, developer, designer, or entrepreneur, our curated collection of
            AI tools helps you work smarter, faster, and more efficiently. We're committed to keeping our
            database up-to-date with the latest innovations in artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Curated Collection</h3>
            <p className="text-slate-400">
              Every tool is carefully reviewed and categorized for easy discovery
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Community Driven</h3>
            <p className="text-slate-400">
              Users can submit tools and share their discoveries with others
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Always Updated</h3>
            <p className="text-slate-400">
              Stay informed with the latest AI news and tool releases
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">What We Offer</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-cyan-400 mt-1">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1">Comprehensive Directory</h3>
                <p className="text-slate-400">
                  Browse through 1000+ AI tools across multiple categories including writing, image generation,
                  video editing, coding, and more
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-cyan-400 mt-1">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1">Advanced Filtering</h3>
                <p className="text-slate-400">
                  Find exactly what you need with powerful filters for category, pricing, popularity, and more
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-cyan-400 mt-1">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1">Side-by-Side Comparisons</h3>
                <p className="text-slate-400">
                  Compare tools directly to make informed decisions about which solution is best for you
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-cyan-400 mt-1">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1">Latest AI News</h3>
                <p className="text-slate-400">
                  Stay updated with breaking news and announcements from the AI industry
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-12">
          <h2 className="text-2xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-slate-300 mb-6">
            Be part of 10,000+ AI enthusiasts discovering new tools every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/explore"
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
            >
              Explore Tools
            </a>
            <a
              href="/submit"
              className="px-8 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
              Submit a Tool
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
