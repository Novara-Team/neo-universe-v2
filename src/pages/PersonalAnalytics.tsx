import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Star,
  Eye,
  GitCompare,
  Folder,
  Calendar,
  Award,
  BarChart3,
  Clock,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getAnalyticsSummary,
  getActivityStreak,
  getActivityTimeSeries,
  getEventBreakdown,
  getCategoryBreakdown,
  getRecentActivity,
  getPeakActivityTimes,
  getWeekdayActivity,
  getMonthlyComparison,
  type AnalyticsSummary,
  type ActivityStreak,
  type TimeSeriesData,
  type CategoryBreakdown,
  type PeakActivityTime,
  type WeekdayActivity,
  type MonthlyComparison
} from '../lib/analytics';

export default function PersonalAnalytics() {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [streak, setStreak] = useState<ActivityStreak | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [eventBreakdown, setEventBreakdown] = useState<Array<{ event_type: string; count: number }>>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{
    event_type: string;
    event_data: Record<string, unknown>;
    created_at: string;
  }>>([]);
  const [peakTimes, setPeakTimes] = useState<PeakActivityTime[]>([]);
  const [weekdayActivity, setWeekdayActivity] = useState<WeekdayActivity[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [
        summaryData,
        streakData,
        timeSeriesData,
        eventsData,
        categoriesData,
        activityData,
        peakTimesData,
        weekdayData,
        monthlyData
      ] = await Promise.all([
        getAnalyticsSummary(),
        getActivityStreak(),
        getActivityTimeSeries(timeRange),
        getEventBreakdown(),
        getCategoryBreakdown(),
        getRecentActivity(20),
        getPeakActivityTimes(),
        getWeekdayActivity(),
        getMonthlyComparison()
      ]);

      setSummary(summaryData);
      setStreak(streakData);
      setTimeSeries(timeSeriesData);
      setEventBreakdown(eventsData);
      setCategoryBreakdown(categoriesData);
      setRecentActivity(activityData);
      setPeakTimes(peakTimesData);
      setWeekdayActivity(weekdayData);
      setMonthlyComparison(monthlyData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementLevel = (score: number): { level: string; color: string; icon: any } => {
    if (score >= 500) return { level: 'Elite', color: 'from-purple-500 to-pink-500', icon: Zap };
    if (score >= 300) return { level: 'Expert', color: 'from-blue-500 to-cyan-500', icon: Award };
    if (score >= 150) return { level: 'Advanced', color: 'from-green-500 to-emerald-500', icon: Target };
    if (score >= 50) return { level: 'Active', color: 'from-yellow-500 to-orange-500', icon: TrendingUp };
    return { level: 'Beginner', color: 'from-slate-500 to-slate-600', icon: Activity };
  };

  const formatEventType = (type: string): string => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getEventIcon = (type: string) => {
    if (type.includes('view')) return <Eye className="h-4 w-4" />;
    if (type.includes('compare')) return <GitCompare className="h-4 w-4" />;
    if (type.includes('favorite')) return <Star className="h-4 w-4" />;
    if (type.includes('collection')) return <Folder className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getTimeIcon = (hour: number) => {
    if (hour >= 5 && hour < 12) return <Sunrise className="h-5 w-5 text-orange-400" />;
    if (hour >= 12 && hour < 17) return <Sun className="h-5 w-5 text-yellow-400" />;
    if (hour >= 17 && hour < 21) return <Sunset className="h-5 w-5 text-orange-500" />;
    return <Moon className="h-5 w-5 text-blue-400" />;
  };

  const calculateTrend = (): { value: number; isPositive: boolean } => {
    if (timeSeries.length < 2) return { value: 0, isPositive: true };

    const mid = Math.floor(timeSeries.length / 2);
    const firstHalf = timeSeries.slice(0, mid).reduce((sum, d) => sum + d.count, 0);
    const secondHalf = timeSeries.slice(mid).reduce((sum, d) => sum + d.count, 0);

    if (firstHalf === 0) return { value: 100, isPositive: true };
    const trend = ((secondHalf - firstHalf) / firstHalf) * 100;
    return { value: Math.abs(Math.round(trend)), isPositive: trend >= 0 };
  };

  if (!user || profile?.subscription_plan !== 'pro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <Award className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Personal Analytics</h1>
          <p className="text-slate-400 mb-6">
            Unlock detailed insights and analytics about your activity with the Pro plan.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  const engagement = summary ? getEngagementLevel(summary.engagement_score) : { level: 'Beginner', color: 'from-slate-500 to-slate-600', icon: Activity };
  const trend = calculateTrend();
  const EngagementIcon = engagement.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Personal Analytics</h1>
              <p className="text-slate-400">Your comprehensive activity dashboard</p>
            </div>
            <div className={`px-6 py-3 bg-gradient-to-r ${engagement.color} rounded-2xl shadow-xl flex items-center gap-3`}>
              <EngagementIcon className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">{engagement.level}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as 7 | 30 | 90)}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  timeRange === days
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {trend.value}%
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{summary?.total_tool_views || 0}</h3>
            <p className="text-slate-400 text-sm">Tool Views</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="p-3 bg-green-500/20 rounded-xl mb-4 w-fit">
              <GitCompare className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{summary?.total_comparisons || 0}</h3>
            <p className="text-slate-400 text-sm">Comparisons</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
            <div className="p-3 bg-yellow-500/20 rounded-xl mb-4 w-fit">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{summary?.total_favorites || 0}</h3>
            <p className="text-slate-400 text-sm">Favorites</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
            <div className="p-3 bg-purple-500/20 rounded-xl mb-4 w-fit">
              <Folder className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{summary?.total_collections || 0}</h3>
            <p className="text-slate-400 text-sm">Collections</p>
          </div>
        </div>

        {monthlyComparison && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-cyan-400" />
              Monthly Activity Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Current Month</p>
                <p className="text-3xl font-bold text-white">{monthlyComparison.current_month}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Previous Month</p>
                <p className="text-3xl font-bold text-slate-300">{monthlyComparison.previous_month}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Growth</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold ${monthlyComparison.growth_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {monthlyComparison.growth_percentage >= 0 ? '+' : ''}{monthlyComparison.growth_percentage}%
                  </p>
                  {monthlyComparison.growth_percentage >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-cyan-400" />
              Peak Activity Hours
            </h2>
            {peakTimes.length > 0 ? (
              <div className="space-y-3">
                {peakTimes.slice(0, 5).map((time, index) => {
                  const maxCount = Math.max(...peakTimes.map(t => t.count));
                  const percentage = (time.count / maxCount) * 100;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      {getTimeIcon(time.hour)}
                      <span className="text-slate-300 w-16">{time.label}</span>
                      <div className="flex-1 bg-slate-700/50 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full flex items-center justify-end px-3"
                          style={{ width: `${Math.max(percentage, 10)}%` }}
                        >
                          <span className="text-white text-sm font-bold">{time.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No activity data yet</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-green-400" />
              Activity by Day
            </h2>
            {weekdayActivity.length > 0 ? (
              <div className="space-y-3">
                {weekdayActivity.map((day, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm font-medium">{day.day}</span>
                      <span className="text-slate-400 text-sm">{day.count} actions</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                        style={{ width: `${day.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No activity data yet</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              Activity Timeline
            </h2>
            {timeSeries.length > 0 ? (
              <div className="space-y-2">
                {timeSeries.slice(-14).map((data, index) => {
                  const maxCount = Math.max(...timeSeries.map(d => d.count));
                  const percentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-slate-400 w-20">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-slate-700/50 rounded-full h-10 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full flex items-center justify-end px-4 transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 8)}%` }}
                        >
                          {data.count > 0 && (
                            <span className="text-white text-sm font-bold">{data.count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">No activity data yet</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              Streak Stats
            </h2>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4 shadow-xl">
                <div>
                  <div className="text-5xl font-bold text-white">{streak?.current_streak || 0}</div>
                  <div className="text-sm text-white/90">days</div>
                </div>
              </div>
              <p className="text-slate-400">Current Streak</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Longest Streak</span>
                <span className="text-white font-bold text-lg">{streak?.longest_streak || 0} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Engagement Score</span>
                <span className="text-white font-bold text-lg">{summary?.engagement_score || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-400" />
              Event Distribution
            </h2>
            {eventBreakdown.length > 0 ? (
              <div className="space-y-4">
                {eventBreakdown.slice(0, 5).map((event, index) => {
                  const total = eventBreakdown.reduce((sum, e) => sum + e.count, 0);
                  const percentage = Math.round((event.count / total) * 100);
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.event_type)}
                          <span className="text-slate-300 font-medium">{formatEventType(event.event_type)}</span>
                        </div>
                        <span className="text-white font-bold">{event.count}</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">No events tracked yet</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-400" />
              Top Categories
            </h2>
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {categoryBreakdown.slice(0, 6).map((category, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex justify-between mb-2">
                      <span className="text-white font-medium">{category.category}</span>
                      <span className="text-purple-400 font-bold">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">No category data yet</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-400" />
            Recent Activity Feed
          </h2>
          {recentActivity.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                  <div className="p-2.5 bg-blue-500/20 rounded-lg">
                    {getEventIcon(activity.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{formatEventType(activity.event_type)}</p>
                    {activity.event_data?.tool_name && (
                      <p className="text-slate-400 text-xs truncate">{String(activity.event_data.tool_name)}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-12">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
