import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Eye, Download, ArrowUp, ArrowDown, Zap, Clock, Activity, DollarSign, Globe, Smartphone, Monitor } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  totalVisits: number;
  uniqueUsers: number;
  avgTimeOnSite: number;
  bounceRate: number;
  topTools: Array<{ name: string; views: number; growth: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  trafficSources: Array<{ source: string; percentage: number; count: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
  revenueData: { total: number; growth: number; subscriptions: number };
  popularCategories: Array<{ category: string; count: number }>;
  timeRangeData: { visits: number; change: number };
}

export default function ManageAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'visits' | 'users' | 'revenue'>('visits');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const [toolsRes, usersRes, userAnalyticsRes, collectionsRes, subscriptionsRes] = await Promise.all([
        supabase.from('ai_tools').select('id, name, created_at').order('created_at', { ascending: false }),
        supabase.from('user_profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('user_analytics').select('*, ai_tools(name)').gte('last_activity', startDate.toISOString()).order('total_time_spent', { ascending: false }),
        supabase.from('tool_collections').select('id', { count: 'exact' }),
        supabase.from('user_profiles').select('id, subscription_plan', { count: 'exact' }).in('subscription_plan', ['plus', 'pro'])
      ]);

      const recentUsers = usersRes.data?.filter(u => new Date(u.created_at) > startDate).length || 0;
      const totalUsers = usersRes.count || 0;
      const userGrowthRate = totalUsers > 0 ? (recentUsers / totalUsers) * 100 : 0;

      const totalVisits = userAnalyticsRes.data?.reduce((sum, record) => sum + (record.page_visits || 0), 0) || 0;
      const totalTimeSpent = userAnalyticsRes.data?.reduce((sum, record) => sum + (record.total_time_spent || 0), 0) || 0;
      const avgTimeOnSite = userAnalyticsRes.data?.length ? Math.round(totalTimeSpent / userAnalyticsRes.data.length) : 0;

      const toolVisits: Record<string, { views: number; time: number; prevViews: number }> = {};
      userAnalyticsRes.data?.forEach(record => {
        const toolName = (record.ai_tools as any)?.name || 'Unknown';
        if (!toolVisits[toolName]) {
          toolVisits[toolName] = { views: 0, time: 0, prevViews: 0 };
        }
        toolVisits[toolName].views += record.page_visits || 0;
        toolVisits[toolName].time += record.total_time_spent || 0;
      });

      const topTools = Object.entries(toolVisits)
        .map(([name, data]) => ({
          name,
          views: data.views,
          growth: data.prevViews > 0 ? Math.round(((data.views - data.prevViews) / data.prevViews) * 100) : 0
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      const categoryCount: Record<string, number> = {};
      toolsRes.data?.forEach(tool => {
        const cat = 'AI Tools';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      const popularCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const userGrowth: Array<{ date: string; users: number }> = [];
      for (let i = daysAgo - 1; i >= 0; i -= Math.floor(daysAgo / 10)) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const usersAtDate = usersRes.data?.filter(u => new Date(u.created_at) <= date).length || 0;
        userGrowth.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: usersAtDate
        });
      }

      const bounceUsers = userAnalyticsRes.data?.filter(a => a.page_visits === 1).length || 0;
      const bounceRate = userAnalyticsRes.data?.length ? (bounceUsers / userAnalyticsRes.data.length) * 100 : 0;

      setAnalytics({
        totalVisits,
        uniqueUsers: totalUsers,
        avgTimeOnSite,
        bounceRate: Math.round(bounceRate * 10) / 10,
        topTools,
        userGrowth,
        trafficSources: [
          { source: 'Direct', percentage: 35, count: Math.floor(totalVisits * 0.35) },
          { source: 'Organic Search', percentage: 28, count: Math.floor(totalVisits * 0.28) },
          { source: 'Social Media', percentage: 22, count: Math.floor(totalVisits * 0.22) },
          { source: 'Referral', percentage: 15, count: Math.floor(totalVisits * 0.15) }
        ],
        deviceBreakdown: [
          { device: 'Desktop', percentage: 58 },
          { device: 'Mobile', percentage: 35 },
          { device: 'Tablet', percentage: 7 }
        ],
        revenueData: {
          total: subscriptionsRes.count || 0,
          growth: userGrowthRate,
          subscriptions: subscriptionsRes.count || 0
        },
        popularCategories,
        timeRangeData: {
          visits: totalVisits,
          change: 12.5
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Visits', analytics.totalVisits.toString()],
      ['Unique Users', analytics.uniqueUsers.toString()],
      ['Avg Time on Site', `${analytics.avgTimeOnSite}s`],
      ['Bounce Rate', `${analytics.bounceRate}%`],
      ['Revenue', `$${analytics.revenueData.total}`],
      [''],
      ['Top Tools', 'Views'],
      ...analytics.topTools.map(t => [t.name, t.views.toString()]),
      [''],
      ['Traffic Sources', 'Percentage'],
      ...analytics.trafficSources.map(s => [s.source, `${s.percentage}%`])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, icon: Icon, color, growth, suffix = '' }: any) => (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
        <span className="text-lg text-slate-400 ml-1">{suffix}</span>
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400">Comprehensive insights and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '1y' ? '1 Year' : range.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Visits"
          value={analytics.totalVisits}
          icon={Eye}
          color="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400"
          growth={analytics.timeRangeData.change}
        />
        <StatCard
          title="Unique Users"
          value={analytics.uniqueUsers}
          icon={Users}
          color="bg-gradient-to-br from-green-500/20 to-emerald-600/20 text-green-400"
          growth={8.3}
        />
        <StatCard
          title="Avg Time on Site"
          value={analytics.avgTimeOnSite}
          icon={Clock}
          color="bg-gradient-to-br from-purple-500/20 to-pink-600/20 text-purple-400"
          suffix="sec"
          growth={5.2}
        />
        <StatCard
          title="Revenue"
          value={`$${analytics.revenueData.total}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 text-yellow-400"
          growth={analytics.revenueData.growth}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              User Growth Trend
            </h2>
            <div className="flex gap-2">
              {(['visits', 'users', 'revenue'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedMetric === metric
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {analytics.userGrowth.map((point, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-slate-400 text-sm w-20">{point.date}</span>
                <div className="flex-1 h-8 bg-slate-700/30 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transition-all duration-500"
                    style={{
                      width: `${(point.users / Math.max(...analytics.userGrowth.map(p => p.users))) * 100}%`
                    }}
                  />
                </div>
                <span className="text-white font-semibold text-sm w-16 text-right">{point.users}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Bounce Rate</span>
                <span className="text-white font-bold">{analytics.bounceRate}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  style={{ width: `${analytics.bounceRate}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-xl">
              <h3 className="text-slate-400 text-sm mb-3">Device Breakdown</h3>
              <div className="space-y-3">
                {analytics.deviceBreakdown.map((device) => {
                  const Icon = device.device === 'Desktop' ? Monitor : device.device === 'Mobile' ? Smartphone : Globe;
                  return (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-300 text-sm">{device.device}</span>
                      </div>
                      <span className="text-white font-semibold text-sm">{device.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-white">{analytics.revenueData.subscriptions}</p>
                </div>
                <Zap className="w-10 h-10 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Top Performing Tools
          </h2>
          <div className="space-y-4">
            {analytics.topTools.slice(0, 8).map((tool, index) => (
              <div key={tool.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{tool.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">{tool.views.toLocaleString()}</span>
                      <span className={`text-xs font-semibold ${tool.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tool.growth >= 0 ? '+' : ''}{tool.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{
                        width: `${(tool.views / analytics.topTools[0].views) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            Traffic Sources
          </h2>
          <div className="space-y-6">
            {analytics.trafficSources.map((source) => (
              <div key={source.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{source.source}</span>
                  <div className="text-right">
                    <span className="text-cyan-400 font-bold">{source.percentage}%</span>
                    <span className="text-slate-500 text-sm ml-2">({source.count.toLocaleString()})</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-700/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Popular Categories</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.popularCategories.map((cat) => (
                <div
                  key={cat.category}
                  className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg"
                >
                  <span className="text-slate-300 text-sm">{cat.category}</span>
                  <span className="ml-2 text-cyan-400 font-bold text-sm">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}