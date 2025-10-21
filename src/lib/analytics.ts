import { supabase } from './supabase';

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  total_tool_views: number;
  total_comparisons: number;
  total_collections: number;
  total_favorites: number;
  top_categories: Array<{ category: string; count: number }>;
  engagement_score: number;
  last_calculated_at: string;
}

export interface ActivityStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export async function trackEvent(eventType: string, eventData?: Record<string, unknown>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_analytics_events').insert({
    user_id: user.id,
    event_type: eventType,
    event_data: eventData || {}
  });

  await supabase.rpc('update_user_activity_streak', { p_user_id: user.id });
  await supabase.rpc('update_user_analytics_summary', { p_user_id: user.id });
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_analytics_summary')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching analytics summary:', error);
    return null;
  }

  return data;
}

export async function getActivityStreak(): Promise<ActivityStreak | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_activity_streaks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching activity streak:', error);
    return null;
  }

  return data;
}

export async function getActivityTimeSeries(days: number = 30): Promise<TimeSeriesData[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('user_analytics_events')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching time series:', error);
    return [];
  }

  const groupedByDate = data.reduce((acc: Record<string, number>, event) => {
    const date = new Date(event.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(groupedByDate).map(([date, count]) => ({
    date,
    count
  }));
}

export async function getEventBreakdown(): Promise<Array<{ event_type: string; count: number }>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_analytics_events')
    .select('event_type')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching event breakdown:', error);
    return [];
  }

  const grouped = data.reduce((acc: Record<string, number>, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([event_type, count]) => ({ event_type, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_analytics_events')
    .select('event_data')
    .eq('user_id', user.id)
    .not('event_data->category', 'is', null);

  if (error) {
    console.error('Error fetching category breakdown:', error);
    return [];
  }

  const grouped = data.reduce((acc: Record<string, number>, event) => {
    const category = (event.event_data as { category?: string })?.category;
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {});

  const total = Object.values(grouped).reduce((sum, count) => sum + count, 0);

  return Object.entries(grouped)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getRecentActivity(limit: number = 10): Promise<Array<{
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_analytics_events')
    .select('event_type, event_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return data;
}
