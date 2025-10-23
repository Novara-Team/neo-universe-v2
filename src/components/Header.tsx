import { Link } from 'react-router-dom';
import { Sparkles, User, LogOut, Crown, Zap, Settings, Heart, Folder, Lightbulb, BarChart3, Menu, X, MessageSquare, Gift, Bot } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        setScrolled(window.scrollY > 50);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const getPlanBadge = () => {
    if (!profile) return null;

    if ((profile as any).custom_badge === 'owner') {
      return (
        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
          <Crown className="w-3 h-3" />
          OWNER
        </span>
      );
    }

    if ((profile as any).custom_badge === 'team') {
      return (
        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
          <User className="w-3 h-3" />
          TEAM
        </span>
      );
    }

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
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-900/98 backdrop-blur-xl shadow-xl shadow-slate-900/50 border-b border-slate-700/50'
          : 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'
        }`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-slate-300 hover:text-white transition-all hover:scale-110"
            >
              {showMobileMenu ? <X className="w-6 h-6 transition-transform rotate-90" /> : <Menu className="w-6 h-6 transition-transform" />}
            </button>
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-all">
              <Sparkles className={`text-cyan-400 transition-all duration-300 ${
                scrolled ? 'w-6 h-6 md:w-7 md:h-7' : 'w-8 h-8 md:w-9 md:h-9'
              }`} />
              <span className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent transition-all duration-300 ${
                scrolled ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
              }`}>
                AI Universe
              </span>
            </Link>
          </div>

          <nav className={`hidden md:flex items-center transition-all duration-300 ${
            scrolled ? 'space-x-6' : 'space-x-8'
          }`}>
            <Link to="/" className="text-slate-300 hover:text-white transition-all relative group">
              <span className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/explore" className="text-slate-300 hover:text-white transition-all relative group">
              <span className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>Explore</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/top-tools" className="text-slate-300 hover:text-white transition-all relative group">
              <span className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>Top Tools</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/compare" className="text-slate-300 hover:text-white transition-all relative group">
              <span className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>Compare</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {(profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro') && (
              <Link to="/news" className="text-slate-300 hover:text-white transition-all relative group">
                <span className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>News</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            <Link to="/submit" className="text-slate-300 hover:text-white transition-all relative group">
              <span className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>Submit Tool</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {!(profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro') && (
              <Link to="/pricing" className="text-slate-300 hover:text-white transition-all relative group">
                <span className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>Pricing</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            <Link to="/about" className="text-slate-300 hover:text-white transition-all relative group">
              <span className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>About</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <>
                <Link
                  to="/referrals"
                  className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors relative group"
                  title="Referrals"
                >
                  <Gift className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" />
                </Link>
                <NotificationBell />
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all hover:scale-105"
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
                      className="fixed inset-0 z-10 animate-in fade-in duration-200"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-20 animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-200">
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
                            Collections
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
                            to="/ai-select"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Bot className="w-4 h-4 text-cyan-400" />
                            <span className="flex items-center gap-2">
                              AI Select
                              <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded">
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
                          to="/referrals"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Gift className="w-4 h-4 text-cyan-400" />
                          <span className="flex items-center gap-2">
                            Referral Program
                            <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded">
                              NEW
                            </span>
                          </span>
                        </Link>

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

      </div>

      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
            <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden pointer-events-auto animate-in slide-in-from-top-10 fade-in zoom-in-95 duration-300">
              {user && (
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700/50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{profile?.full_name || 'User'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-slate-400 text-sm truncate">{user.email}</p>
                      </div>
                    </div>
                    {getPlanBadge()}
                  </div>
                </div>
              )}

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <nav className="flex flex-col p-4 space-y-1">
                  <div className="mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Navigation</p>
                    <Link
                      to="/"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/70 px-3 py-2.5 rounded-lg transition-all"
                    >
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium">Home</span>
                    </Link>
                    <Link
                      to="/explore"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/70 px-3 py-2.5 rounded-lg transition-all"
                    >
                      <Zap className="w-5 h-5 text-blue-400" />
                      <span className="font-medium">Explore</span>
                    </Link>
                    <Link
                      to="/top-tools"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/70 px-3 py-2.5 rounded-lg transition-all"
                    >
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="font-medium">Top Tools</span>
                    </Link>
                    <Link
                      to="/compare"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/70 px-3 py-2.5 rounded-lg transition-all"
                    >
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium">Compare</span>
                    </Link>
                    {(profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro') && (
                      <Link
                        to="/news"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/70 px-3 py-2.5 rounded-lg transition-all"
                      >
                        <MessageSquare className="w-5 h-5 text-green-400" />
                        <span className="font-medium">News</span>
                      </Link>
                    )}
                    <Link
                      to="/submit"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/70 px-3 py-2.5 rounded-lg transition-all"
                    >
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      <span className="font-medium">Submit Tool</span>
                    </Link>
                    {!(profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro') && (
                      <Link
                        to="/pricing"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/70 px-3 py-2.5 rounded-lg transition-all"
                      >
                        <Crown className="w-5 h-5 text-amber-400" />
                        <span className="font-medium">Pricing</span>
                      </Link>
                    )}
                    <Link
                      to="/about"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/70 px-3 py-2.5 rounded-lg transition-all"
                    >
                      <Sparkles className="w-5 h-5 text-slate-400" />
                      <span className="font-medium">About</span>
                    </Link>
                  </div>

                  {user ? (
                    <div className="pt-3 border-t border-slate-700/50 mt-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">My Account</p>
                      <div className="space-y-1">
                        <Link
                          to="/favorites"
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-all"
                        >
                          <Heart className="w-5 h-5 text-red-400" />
                          <span className="font-medium">Favorites</span>
                        </Link>
                        {profile && (profile.subscription_plan === 'plus' || profile.subscription_plan === 'pro') && (
                          <Link
                            to="/collections"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-all"
                          >
                            <Folder className="w-5 h-5 text-blue-400" />
                            <span className="font-medium">Collections</span>
                          </Link>
                        )}
                        {profile && profile.subscription_plan === 'pro' && (
                          <>
                            <Link
                              to="/recommendations"
                              onClick={() => setShowMobileMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-all"
                            >
                              <Lightbulb className="w-5 h-5 text-yellow-400" />
                              <span className="font-medium flex items-center gap-2">
                                Recommendations
                                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">PRO</span>
                              </span>
                            </Link>
                            <Link
                              to="/analytics"
                              onClick={() => setShowMobileMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-all"
                            >
                              <BarChart3 className="w-5 h-5 text-green-400" />
                              <span className="font-medium flex items-center gap-2">
                                Analytics
                                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">PRO</span>
                              </span>
                            </Link>
                          </>
                        )}
                        <Link
                          to="/settings"
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-all"
                        >
                          <Settings className="w-5 h-5 text-slate-400" />
                          <span className="font-medium">Settings</span>
                        </Link>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <button
                          onClick={() => {
                            signOut();
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-medium"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-700/50 mt-2">
                      <div className="space-y-2">
                        <Link
                          to="/login"
                          onClick={() => setShowMobileMenu(false)}
                          className="block px-4 py-2.5 text-center text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all font-medium"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setShowMobileMenu(false)}
                          className="block px-4 py-2.5 text-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20 font-semibold"
                        >
                          Get Started
                        </Link>
                      </div>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
