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
  PieChart,
  Clock,
  Zap,
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../lib/useAuth';
import {
  getAnalyticsSummary,
  getActivityStreak,
  getActivityTimeSeries,
  getEventBreakdown,
  getCategoryBreakdown,
  getRecentActivity,
  type AnalyticsSummary,
  type ActivityStreak,
  type TimeSeriesData,
  type CategoryBreakdown
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
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryData, streakData, timeSeriesData, eventsData, categoriesData, activityData] = await Promise.all([
        getAnalyticsSummary(),
        getActivityStreak(),
        getActivityTimeSeries(timeRange),
        getEventBreakdown(),
        getCategoryBreakdown(),
        getRecentActivity(20)
      ]);

      setSummary(summaryData);
      setStreak(streakData);
      setTimeSeries(timeSeriesData);
      setEventBreakdown(eventsData);
      setCategoryBreakdown(categoriesData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementLevel = (score: number): { level: string; color: string } => {
    if (score >= 500) return { level: 'Elite', color: 'text-purple-600' };
    if (score >= 300) return { level: 'Expert', color: 'text-blue-600' };
    if (score >= 150) return { level: 'Advanced', color: 'text-green-600' };
    if (score >= 50) return { level: 'Active', color: 'text-yellow-600' };
    return { level: 'Beginner', color: 'text-gray-600' };
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Personal Analytics</h1>
            <p className="text-gray-600 mb-6">
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
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const engagement = summary ? getEngagementLevel(summary.engagement_score) : { level: 'Beginner', color: 'text-gray-600' };
  const trend = calculateTrend();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Personal Analytics</h1>
            <p className="text-gray-600">Track your AI tool discovery journey and engagement</p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className={`h-6 w-6 ${engagement.color}`} />
              <span className="text-lg font-semibold text-gray-900">
                Engagement Level: <span className={engagement.color}>{engagement.level}</span>
              </span>
            </div>

            <div className="flex space-x-2">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days as 7 | 30 | 90)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === days
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span>{trend.value}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{summary?.total_tool_views || 0}</h3>
              <p className="text-gray-600 text-sm">Total Tool Views</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <GitCompare className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{summary?.total_comparisons || 0}</h3>
              <p className="text-gray-600 text-sm">Comparisons Made</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{summary?.total_favorites || 0}</h3>
              <p className="text-gray-600 text-sm">Favorite Tools</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Folder className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{summary?.total_collections || 0}</h3>
              <p className="text-gray-600 text-sm">Collections Created</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                  Activity Over Time
                </h2>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>

              {timeSeries.length > 0 ? (
                <div className="space-y-2">
                  {timeSeries.slice(-14).map((data, index) => {
                    const maxCount = Math.max(...timeSeries.map(d => d.count));
                    const percentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;

                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-24">
                          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end px-3 transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            {data.count > 0 && (
                              <span className="text-white text-xs font-semibold">{data.count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">No activity data available yet</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-yellow-600" />
                Activity Streak
              </h2>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-4 shadow-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{streak?.current_streak || 0}</div>
                    <div className="text-sm text-white opacity-90">days</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Current Streak</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-gray-700">Longest Streak</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{streak?.longest_streak || 0} days</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Engagement Score</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{summary?.engagement_score || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Last Active</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {streak?.last_activity_date ? new Date(streak.last_activity_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <PieChart className="h-6 w-6 mr-2 text-green-600" />
                Activity Breakdown
              </h2>

              {eventBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {eventBreakdown.slice(0, 5).map((event, index) => {
                    const total = eventBreakdown.reduce((sum, e) => sum + e.count, 0);
                    const percentage = Math.round((event.count / total) * 100);

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getEventIcon(event.event_type)}
                            <span className="text-sm font-medium text-gray-700">{formatEventType(event.event_type)}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{event.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">No activity breakdown available yet</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-purple-600" />
                Category Interests
              </h2>

              {categoryBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {categoryBreakdown.slice(0, 6).map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{category.category}</span>
                          <span className="text-sm font-bold text-purple-600">{category.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">No category data available yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-blue-600" />
              Recent Activity
            </h2>

            {recentActivity.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getEventIcon(activity.event_type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatEventType(activity.event_type)}</p>
                        {activity.event_data?.tool_name && (
                          <p className="text-xs text-gray-600">{String(activity.event_data.tool_name)}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-12">No recent activity to display</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
