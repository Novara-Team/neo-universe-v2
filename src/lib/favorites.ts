import { supabase } from './supabase';

export interface FavoriteLimit {
  canFavorite: boolean;
  currentCount: number;
  maxCount: number | null;
  message?: string;
}

export async function checkFavoriteLimit(userId: string): Promise<FavoriteLimit> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_plan')
    .eq('id', userId)
    .maybeSingle();

  const { count } = await supabase
    .from('user_favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const currentCount = count || 0;
  const subscriptionPlan = profile?.subscription_plan || 'free';

  if (subscriptionPlan === 'free') {
    const maxCount = 3;
    return {
      canFavorite: currentCount < maxCount,
      currentCount,
      maxCount,
      message: currentCount >= maxCount
        ? 'Free plan limited to 3 favorites. Upgrade to favorite unlimited tools!'
        : undefined,
    };
  }

  return {
    canFavorite: true,
    currentCount,
    maxCount: null,
  };
}

export async function addFavorite(userId: string, toolId: string): Promise<{ success: boolean; error?: string }> {
  const limit = await checkFavoriteLimit(userId);

  if (!limit.canFavorite) {
    return {
      success: false,
      error: limit.message || 'Cannot add more favorites',
    };
  }

  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, tool_id: toolId });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Tool already in favorites' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function removeFavorite(userId: string, toolId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('tool_id', toolId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function isFavorite(userId: string, toolId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .maybeSingle();

  return !!data;
}

export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .select(`
      id,
      created_at,
      tool_id,
      tools (
        id,
        name,
        description,
        website_url,
        logo_url,
        category,
        pricing_type,
        rating,
        total_reviews,
        is_featured,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
