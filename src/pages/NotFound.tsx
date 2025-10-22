import { Link } from 'react-router-dom';
import { Home, Search, Sparkles, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl mb-8 backdrop-blur-xl border border-cyan-500/30">
            <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Page Not Found
        </h1>

        <p className="text-xl text-slate-400 mb-12 max-w-lg mx-auto">
          Oops! The page you're looking for seems to have wandered off into the AI universe. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 border border-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800 hover:border-slate-600 transition-all backdrop-blur-xl hover:scale-105"
          >
            <Search className="w-5 h-5" />
            Explore Tools
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/"
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-cyan-500/50 transition-all group"
          >
            <Home className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-2">Home</h3>
            <p className="text-sm text-slate-400">Start fresh from our homepage</p>
          </Link>

          <Link
            to="/explore"
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-blue-500/50 transition-all group"
          >
            <Sparkles className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-2">Explore</h3>
            <p className="text-sm text-slate-400">Discover amazing AI tools</p>
          </Link>

          <Link
            to="/support"
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-slate-500/50 transition-all group"
          >
            <Search className="w-8 h-8 text-slate-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
            <p className="text-sm text-slate-400">Need help? Contact us</p>
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-12 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Go back to previous page
        </button>
      </div>
    </div>
  );
}
