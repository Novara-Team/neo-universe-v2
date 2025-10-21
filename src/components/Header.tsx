import { Link } from 'react-router-dom';
import { Sparkles, User, LogOut, Crown, Zap, Settings, Heart, Folder } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { useState } from 'react';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPlanBadge = () => {
    if (!profile) return null;

    if (profile.subscription_plan === 'pro') {
      return (
        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3" />
          PRO
        </span>
      );
    }

    if (profile.subscription_plan === 'plus') {
      return (
        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" />
          PLUS
        </span>
      );
    }

    return null;
  };

  return (
    <header className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI Universe
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/explore" className="text-slate-300 hover:text-white transition-colors">
              Explore
            </Link>
            <Link to="/top-tools" className="text-slate-300 hover:text-white transition-colors">
              Top Tools
            </Link>
            <Link to="/compare" className="text-slate-300 hover:text-white transition-colors">
              Compare
            </Link>
            <Link to="/submit" className="text-slate-300 hover:text-white transition-colors">
              Submit Tool
            </Link>
            <Link to="/pricing" className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-cyan-400" />
                  <span className="text-white text-sm flex items-center">
                    {profile?.full_name || user.email?.split('@')[0]}
                    {getPlanBadge()}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-20">
                      <div className="p-4 border-b border-slate-700">
                        <p className="text-white font-semibold">{profile?.full_name || 'User'}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-slate-300 text-xs">Plan:</span>
                          <span className="text-cyan-400 text-xs font-bold uppercase">
                            {profile?.subscription_plan || 'Free'}
                          </span>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/favorites"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          Favorite Tools
                        </Link>

                        {profile && (profile.subscription_plan === 'plus' || profile.subscription_plan === 'pro') && (
                          <Link
                            to="/collections"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Folder className="w-4 h-4" />
                            My Collections
                          </Link>
                        )}

                        <Link
                          to="/pricing"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Manage Subscription
                        </Link>

                        <button
                          onClick={() => {
                            signOut();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
