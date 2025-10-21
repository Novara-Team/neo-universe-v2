import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Newspaper,
  MessageSquare,
  FileText,
  LogOut,
  Sparkles,
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Bell,
  Settings
} from 'lucide-react';
import { logoutAdmin } from '../lib/auth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/adminpn');
  };

  const navItems = [
    { path: '/adminpn/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/adminpn/tools', icon: Wrench, label: 'AI Tools' },
    { path: '/adminpn/submissions', icon: FileText, label: 'Submissions' },
    { path: '/adminpn/support', icon: MessageCircle, label: 'Support' },
    { path: '/adminpn/reviews', icon: MessageSquare, label: 'Reviews' },
    { path: '/adminpn/news', icon: Newspaper, label: 'AI News' },
    { path: '/adminpn/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex">
        <aside className="w-72 min-h-screen bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-r border-slate-800/50 fixed shadow-2xl">
          <div className="p-6 border-b border-slate-800/50">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  AI Universe
                </div>
                <div className="text-xs text-slate-400 font-medium">Admin Console</div>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-2">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</p>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30'
                        : 'bg-slate-800/50 group-hover:bg-slate-800'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-72 p-4 border-t border-slate-800/50 space-y-2 bg-slate-950/50 backdrop-blur-xl">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800/50 group-hover:bg-red-500/20 transition-all duration-300">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-72">
          <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
            <div className="flex items-center justify-between px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center transition-colors">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                </button>
                <button className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center transition-colors">
                  <Settings className="w-5 h-5 text-slate-400" />
                </button>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
