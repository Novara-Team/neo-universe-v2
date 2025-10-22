import { supabase } from './supabase';

export async function updateAllRankings() {
  try {
    await Promise.all([
      supabase.rpc('update_popular_rankings'),
      supabase.rpc('update_weekly_rankings'),
      supabase.rpc('update_monthly_rankings'),
      supabase.rpc('update_trending_rankings'),
      supabase.rpc('update_rising_rankings')
    ]);
    console.log('All rankings updated successfully');
  } catch (error) {
    console.error('Error updating rankings:', error);
  }
}

export async function trackToolView(toolId: string) {
  try {
    await supabase.rpc('track_tool_view', { p_tool_id: toolId });
  } catch (error) {
    console.error('Error tracking tool view:', error);
  }
}

export async function trackToolClick(toolId: string) {
  try {
    await supabase.rpc('track_tool_click', { p_tool_id: toolId });
  } catch (error) {
    console.error('Error tracking tool click:', error);
  }
}

export async function trackToolFavorite(toolId: string) {
  try {
    await supabase.rpc('track_tool_favorite', { p_tool_id: toolId });
  } catch (error) {
    console.error('Error tracking tool favorite:', error);
  }
}
