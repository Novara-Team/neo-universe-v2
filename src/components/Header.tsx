import { Link } from 'react-router-dom';
import { Sparkles, User, LogOut, Crown, Zap, Settings, Heart, Folder, Lightbulb, BarChart3, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-slate-300 hover:text-white transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Sparkles className="w-8 h-8 text-cyan-400" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AI Universe
              </span>
            </Link>
          </div>

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
            {(profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro') && (
              <Link to="/news" className="text-slate-300 hover:text-white transition-colors">
                News
              </Link>
            )}
            <Link to="/submit" className="text-slate-300 hover:text-white transition-colors">
              Submit Tool
            </Link>
            {!(profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro') && (
              <Link to="/pricing" className="text-slate-300 hover:text-white transition-colors">
                Pricing
              </Link>
            )}
            <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <>
                <NotificationBell />
                <div className="relative hidden sm:block">
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

                        {profile && profile.subscription_plan === 'pro' && (
                          <Link
                            to="/recommendations"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <span className="flex items-center gap-2">
                              Recommendations
                              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">
                                PRO
                              </span>
                            </span>
                          </Link>
                        )}

                        {profile && profile.subscription_plan === 'pro' && (
                          <Link
                            to="/analytics"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <BarChart3 className="w-4 h-4 text-purple-400" />
                            <span className="flex items-center gap-2">
                              Personal Analytics
                              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                                PRO
                              </span>
                            </span>
                          </Link>
                        )}

                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
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
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
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
            {user && (
              <div className="sm:hidden">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col py-4 px-4 space-y-2">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-all"
              >
                Home
              </Link>
              <Link
                to="/explore"
                onClick={() => setShowMobileMenu(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-all"
              >
                Explore
              </Link>
              <Link
                to="/top-tools"
                onClick={() => setShowMobileMenu(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-all"
              >
                Top Tools
              </Link>
              <Link
                to="/compare"
                onClick={() => setShowMobileMenu(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-all"
              >
                Compare
              </Link>
              {(profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro') && (
                <Link
                  to="/news"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-all"
                >
                  News
                </Link>
              )}
              <Link
                to="/submit"
                onClick={() => setShowMobileMenu(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-all"
              >
                Submit Tool
              </Link>
              {!(profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro') && (
                <Link
                  to="/pricing"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-all"
                >
                  Pricing
                </Link>
              )}
              <Link
                to="/about"
                onClick={() => setShowMobileMenu(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-all"
              >
                About
              </Link>

              {user ? (
                <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
                  <Link
                    to="/favorites"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    <Heart className="w-4 h-4" />
                    Favorite Tools
                  </Link>
                  {profile && (profile.subscription_plan === 'plus' || profile.subscription_plan === 'pro') && (
                    <Link
                      to="/collections"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all"
                    >
                      <Folder className="w-4 h-4" />
                      My Collections
                    </Link>
                  )}
                  {profile && profile.subscription_plan === 'pro' && (
                    <Link
                      to="/recommendations"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all"
                    >
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span>Recommendations</span>
                    </Link>
                  )}
                  {profile && profile.subscription_plan === 'pro' && (
                    <Link
                      to="/analytics"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all"
                    >
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span>Personal Analytics</span>
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-slate-800 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-center text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
