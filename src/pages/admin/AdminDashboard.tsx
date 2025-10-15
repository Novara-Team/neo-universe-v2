import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Wrench, Newspaper, TrendingUp, MessageSquare, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTools: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalVisits: 0,
    mostPopularTool: '',
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [toolsRes, reviewsRes, analyticsRes] = await Promise.all([
      supabase.from('ai_tools').select('id, name, views', { count: 'exact' }).order('views', { ascending: false }),
      supabase.from('tool_reviews').select('id', { count: 'exact' }),
      supabase.from('site_analytics').select('total_visits'),
    ]);

    const totalVisits = analyticsRes.data?.reduce((sum, record) => sum + (record.total_visits || 0), 0) || 0;

    setStats({
      totalTools: toolsRes.count || 0,
      totalUsers: 0,
      totalReviews: reviewsRes.count || 0,
      totalVisits,
      mostPopularTool: toolsRes.data?.[0]?.name || 'N/A',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back! Here's what's happening with your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Total Tools</h3>
            <Wrench className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalTools}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Total Reviews</h3>
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalReviews}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Total Visits</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalVisits.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Most Popular</h3>
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-lg font-bold text-white truncate">{stats.mostPopularTool}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link
          to="/adminpn/tools"
          className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <Wrench className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Manage AI Tools
              </h3>
              <p className="text-slate-400 text-sm">Add, edit, or remove AI tools</p>
            </div>
          </div>
        </Link>

        <Link
          to="/adminpn/news"
          className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Newspaper className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                AI News Manager
              </h3>
              <p className="text-slate-400 text-sm">Manage news articles and posts</p>
            </div>
          </div>
        </Link>

        <Link
          to="/adminpn/reviews"
          className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Reviews & Comments
              </h3>
              <p className="text-slate-400 text-sm">Moderate user reviews</p>
            </div>
          </div>
        </Link>

        <Link
          to="/adminpn/submissions"
          className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Submitted Tools
              </h3>
              <p className="text-slate-400 text-sm">Review and approve submissions</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
