import { supabase } from './supabase';

export interface ToolRecommendation {
  id: string;
  tool_id: string;
  score: number;
  reason: string;
  tool?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    rating: number;
    pricing_type: string;
    tags: string[];
  };
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
    const { error } = await supabase.rpc('generate_tool_recommendations', {
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

export async function getRecommendations(userId: string): Promise<ToolRecommendation[]> {
  try {
    const { data, error } = await supabase
      .from('tool_recommendations')
      .select(`
        id,
        tool_id,
        score,
        reason,
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
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(12);

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
