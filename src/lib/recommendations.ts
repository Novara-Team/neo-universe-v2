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
    await supabase.rpc('calculate_emerging_tools');

    const { error } = await supabase.rpc('generate_enhanced_recommendations', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error generating recommendations:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return false;
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
