import { Link, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wrench, Newspaper, MessageSquare, FileText, LogOut, Sparkles } from 'lucide-react';
import { logoutAdmin } from '../lib/auth';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/adminpn');
  };

  const navItems = [
    { path: '/adminpn/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/adminpn/tools', icon: Wrench, label: 'Manage Tools' },
    { path: '/adminpn/news', icon: Newspaper, label: 'AI News' },
    { path: '/adminpn/reviews', icon: MessageSquare, label: 'Reviews' },
    { path: '/adminpn/submissions', icon: FileText, label: 'Submissions' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 fixed">
          <div className="p-6 border-b border-slate-700">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  AI Universe
                </div>
                <div className="text-xs text-slate-400">Admin Panel</div>
              </div>
            </Link>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-64 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
