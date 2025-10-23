import { supabase } from './supabase';

export interface ToolRecommendation {
  id: string;
  tool_id: string;
  score: number;
  reason: string;
  context_score?: number;
  trend_score?: number;
  recommendation_type?: string;
  tool?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    rating: number;
    pricing_type: string;
    tags: string[];
    category?: {
      name: string;
      slug: string;
    };
  };
}

export interface UserContext {
  industry?: string;
  company_size?: string;
  role?: string;
  current_tools?: string[];
  use_cases?: string[];
  budget_range?: string;
  team_size?: number;
  technical_level?: string;
}

export interface ToolBundle {
  id: string;
  name: string;
  description: string;
  industry?: string;
  use_case: string;
  tool_ids: string[];
  estimated_cost?: string;
  difficulty_level?: string;
  setup_time?: string;
  benefits?: string[];
}

export async function trackToolInteraction(
  userId: string | undefined,
  toolId: string,
  interactionType: 'view' | 'favorite' | 'share'
) {
  if (!userId) return;

  try {
    const { error } = await supabase.rpc('upsert_tool_interaction', {
      p_user_id: userId,
      p_tool_id: toolId,
      p_interaction_type: interactionType,
    });

    if (error) {
      console.error('Error tracking interaction:', error);
    }
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
}

export async function generateRecommendations(userId: string) {
  try {
    const [favorites, collections, analytics] = await Promise.all([
      getUserFavorites(userId),
      getUserCollections(userId),
      getUserAnalytics(userId)
    ]);

    if (favorites.length === 0 && collections.length === 0 && !analytics) {
      await createInitialRecommendations(userId);
      return true;
    }

    await createPersonalizedRecommendations(userId, favorites, collections, analytics);
    return true;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    await createInitialRecommendations(userId);
    return false;
  }
}

async function getUserFavorites(userId: string) {
  try {
    const { data } = await supabase
      .from('user_favorites')
      .select('tool_id, ai_tools(tags, category_id)')
      .eq('user_id', userId);
    return data || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

async function getUserCollections(userId: string) {
  try {
    const { data } = await supabase
      .from('tool_collections')
      .select(`
        id,
        tool_collection_items(
          tool_id,
          ai_tools(tags, category_id)
        )
      `)
      .eq('user_id', userId);
    return data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

async function getUserAnalytics(userId: string) {
  try {
    const { data } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('last_visit', { ascending: false })
      .limit(20);
    return data || [];
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

async function createPersonalizedRecommendations(
  userId: string,
  favorites: any[],
  collections: any[],
  analytics: any
) {
  try {
    const favoriteTags = new Set<string>();
    const favoriteCategories = new Set<string>();
    const viewedToolIds = new Set<string>();

    favorites.forEach(fav => {
      if (fav.ai_tools) {
        fav.ai_tools.tags?.forEach((tag: string) => favoriteTags.add(tag));
        if (fav.ai_tools.category_id) favoriteCategories.add(fav.ai_tools.category_id);
      }
    });

    collections.forEach(col => {
      col.tool_collection_items?.forEach((item: any) => {
        if (item.ai_tools) {
          item.ai_tools.tags?.forEach((tag: string) => favoriteTags.add(tag));
          if (item.ai_tools.category_id) favoriteCategories.add(item.ai_tools.category_id);
        }
      });
    });

    if (analytics && Array.isArray(analytics)) {
      analytics.forEach(a => {
        if (a.tool_id) viewedToolIds.add(a.tool_id);
      });
    }

    let query = supabase
      .from('ai_tools')
      .select('id, name, rating, views, tags, category_id')
      .eq('status', 'Published')
      .not('id', 'in', `(${Array.from(viewedToolIds).join(',') || 'null'})`);

    const { data: tools } = await query.limit(100);

    if (!tools || tools.length === 0) {
      await createInitialRecommendations(userId);
      return;
    }

    const recommendations = tools.map(tool => {
      let score = tool.rating * 10;
      let reason = [];

      const matchingTags = tool.tags?.filter((tag: string) => favoriteTags.has(tag)).length || 0;
      if (matchingTags > 0) {
        score += matchingTags * 15;
        reason.push('matches your interests');
      }

      if (favoriteCategories.has(tool.category_id)) {
        score += 20;
        reason.push('similar to your favorites');
      }

      if (tool.rating >= 4.5) {
        score += 10;
        reason.push('highly rated');
      }

      if (tool.views > 1000) {
        score += 5;
        reason.push('popular choice');
      }

      return {
        user_id: userId,
        tool_id: tool.id,
        score: Math.min(score, 100),
        reason: reason.length > 0 ? reason.join(', ') : 'recommended for you',
        recommendation_type: 'personalized',
        context_score: matchingTags * 5,
        trend_score: Math.log10(tool.views + 1)
      };
    }).sort((a, b) => b.score - a.score).slice(0, 20);

    await supabase
      .from('tool_recommendations')
      .delete()
      .eq('user_id', userId);

    if (recommendations.length > 0) {
      await supabase
        .from('tool_recommendations')
        .insert(recommendations);
    }
  } catch (error) {
    console.error('Error creating personalized recommendations:', error);
  }
}

async function createInitialRecommendations(userId: string) {
  try {
    const { data: tools } = await supabase
      .from('ai_tools')
      .select('id, rating, views')
      .eq('status', 'Published')
      .order('rating', { ascending: false })
      .limit(20);

    if (!tools || tools.length === 0) return;

    const recommendations = tools.map((tool, index) => ({
      user_id: userId,
      tool_id: tool.id,
      score: 80 - (index * 3),
      reason: 'Highly rated and popular tool based on community feedback',
      recommendation_type: 'general',
      context_score: 10,
      trend_score: 5
    }));

    await supabase
      .from('tool_recommendations')
      .delete()
      .eq('user_id', userId);

    await supabase
      .from('tool_recommendations')
      .insert(recommendations);
  } catch (error) {
    console.error('Error creating initial recommendations:', error);
  }
}

export async function getRecommendations(userId: string, type?: string): Promise<ToolRecommendation[]> {
  try {
    let query = supabase
      .from('tool_recommendations')
      .select(`
        id,
        tool_id,
        score,
        reason,
        context_score,
        trend_score,
        recommendation_type,
        tool:ai_tools (
          id,
          name,
          slug,
          description,
          logo_url,
          rating,
          pricing_type,
          tags,
          category:categories (
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId);

    if (type) {
      query = query.eq('recommendation_type', type);
    }

    query = query.order('score', { ascending: false }).limit(12);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    return (data || []) as ToolRecommendation[];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

export async function getUserInteractions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tool_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching interactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return [];
  }
}

export async function getUserContext(userId: string): Promise<UserContext | null> {
  try {
    const { data, error } = await supabase
      .from('user_contexts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user context:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user context:', error);
    return null;
  }
}

export async function updateUserContext(userId: string, context: UserContext) {
  try {
    const { error } = await supabase
      .from('user_contexts')
      .upsert({
        user_id: userId,
        ...context,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating user context:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user context:', error);
    return false;
  }
}

export async function getEmergingTools() {
  try {
    const { data, error } = await supabase
      .from('emerging_tools')
      .select(`
        *,
        tool:ai_tools (
          id,
          name,
          slug,
          description,
          logo_url,
          rating,
          pricing_type,
          tags
        )
      `)
      .order('trend_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching emerging tools:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching emerging tools:', error);
    return [];
  }
}

export async function getToolBundles(useCase?: string) {
  try {
    let query = supabase.from('tool_bundles').select('*');

    if (useCase) {
      query = query.eq('use_case', useCase);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tool bundles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching tool bundles:', error);
    return [];
  }
}
