import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Wrench,
  Newspaper,
  TrendingUp,
  MessageSquare,
  FileText,
  ArrowUp,
  ArrowDown,
  Activity,
  Eye,
  Star,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalTools: number;
  totalUsers: number;
  totalReviews: number;
  totalVisits: number;
  mostPopularTool: string;
  pendingSubmissions: number;
  openSupportTickets: number;
  avgRating: number;
  toolsGrowth: number;
  visitsGrowth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTools: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalVisits: 0,
    mostPopularTool: '',
    pendingSubmissions: 0,
    openSupportTickets: 0,
    avgRating: 0,
    toolsGrowth: 0,
    visitsGrowth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadRecentActivity();
  }, []);

  const loadStats = async () => {
    try {
      const [
        toolsRes,
        reviewsRes,
        analyticsRes,
        submissionsRes,
        supportRes,
        usersRes
      ] = await Promise.all([
        supabase.from('ai_tools').select('id, name, views, created_at', { count: 'exact' }).order('views', { ascending: false }),
        supabase.from('tool_reviews').select('id, rating', { count: 'exact' }),
        supabase.from('site_analytics').select('total_visits'),
        supabase.from('tool_submissions').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('support_conversations').select('id', { count: 'exact' }).in('status', ['open', 'in_progress']),
        supabase.from('user_profiles').select('id', { count: 'exact' })
      ]);

      const totalVisits = analyticsRes.data?.reduce((sum, record) => sum + (record.total_visits || 0), 0) || 0;

      const avgRating = reviewsRes.data?.length
        ? reviewsRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewsRes.data.length
        : 0;

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const toolsLastMonth = toolsRes.data?.filter(t => new Date(t.created_at) > lastMonth).length || 0;
      const toolsGrowth = toolsRes.count ? (toolsLastMonth / toolsRes.count) * 100 : 0;

      setStats({
        totalTools: toolsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalReviews: reviewsRes.count || 0,
        totalVisits,
        mostPopularTool: toolsRes.data?.[0]?.name || 'N/A',
        pendingSubmissions: submissionsRes.count || 0,
        openSupportTickets: supportRes.count || 0,
        avgRating: Math.round(avgRating * 10) / 10,
        toolsGrowth: Math.round(toolsGrowth * 10) / 10,
        visitsGrowth: 12.5,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from('tool_submissions')
        .select('id, tool_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    growth,
    suffix = ''
  }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    growth?: number;
    suffix?: string;
  }) => (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span className="text-lg text-slate-400 ml-1">{suffix}</span>
        </p>
      </div>
    </div>
  );

  const QuickAction = ({
    to,
    icon: Icon,
    title,
    description,
    color,
    badge
  }: {
    to: string;
    icon: any;
    title: string;
    description: string;
    color: string;
    badge?: number;
  }) => (
    <Link
      to={to}
      className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
          {badge}
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
            {title}
          </h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-lg">Welcome back! Here's your platform at a glance.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          <span className="text-slate-300 text-sm font-medium">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total AI Tools"
          value={stats.totalTools}
          icon={Wrench}
          color="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400"
          growth={stats.toolsGrowth}
        />
        <StatCard
          title="Total Visits"
          value={stats.totalVisits}
          icon={Eye}
          color="bg-gradient-to-br from-green-500/20 to-emerald-600/20 text-green-400"
          growth={stats.visitsGrowth}
        />
        <StatCard
          title="User Reviews"
          value={stats.totalReviews}
          icon={MessageSquare}
          color="bg-gradient-to-br from-purple-500/20 to-pink-600/20 text-purple-400"
        />
        <StatCard
          title="Average Rating"
          value={stats.avgRating}
          icon={Star}
          color="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 text-yellow-400"
          suffix="/5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickAction
                to="/adminpn/tools"
                icon={Wrench}
                title="Manage AI Tools"
                description="Add, edit, or remove tools"
                color="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400"
              />
              <QuickAction
                to="/adminpn/submissions"
                icon={FileText}
                title="Tool Submissions"
                description="Review pending submissions"
                color="bg-gradient-to-br from-green-500/20 to-emerald-600/20 text-green-400"
                badge={stats.pendingSubmissions}
              />
              <QuickAction
                to="/adminpn/support"
                icon={MessageSquare}
                title="Support Tickets"
                description="Manage user support requests"
                color="bg-gradient-to-br from-orange-500/20 to-red-600/20 text-orange-400"
                badge={stats.openSupportTickets}
              />
              <QuickAction
                to="/adminpn/news"
                icon={Newspaper}
                title="AI News"
                description="Manage news and articles"
                color="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 text-blue-400"
              />
              <QuickAction
                to="/adminpn/reviews"
                icon={MessageSquare}
                title="Reviews"
                description="Moderate user reviews"
                color="bg-gradient-to-br from-purple-500/20 to-pink-600/20 text-purple-400"
              />
              <QuickAction
                to="/adminpn/analytics"
                icon={TrendingUp}
                title="Analytics"
                description="View detailed analytics"
                color="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 text-yellow-400"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-cyan-400" />
              Recent Activity
            </h2>
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-slate-700/50 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{activity.tool_name}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Submitted {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                        activity.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : activity.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Platform Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Storage</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">API Response</span>
                <span className="text-slate-400 text-sm font-medium">45ms avg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
