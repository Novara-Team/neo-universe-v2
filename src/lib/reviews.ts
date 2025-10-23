import { supabase } from './supabase';

export interface ToolReview {
  id: string;
  tool_id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  comment?: string;
  review_text?: string;
  pros?: string[];
  cons?: string[];
  verified_purchase: boolean;
  helpful_count: number;
  approved: boolean;
  created_at: string;
  updated_at?: string;
  user_badge?: string | null;
  subscription_plan?: string;
}

export interface HelpfulVote {
  id: string;
  review_id: string;
  voter_id: string;
  created_at: string;
}

export async function getToolReviews(toolId: string): Promise<ToolReview[]> {
  const { data, error } = await supabase
    .from('tool_reviews')
    .select(`
      *,
      user_profiles!tool_reviews_user_id_fkey (
        custom_badge,
        subscription_plan
      )
    `)
    .eq('tool_id', toolId)
    .eq('approved', true)
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return (data || []).map((review: any) => ({
    ...review,
    user_badge: review.user_profiles?.custom_badge,
    subscription_plan: review.user_profiles?.subscription_plan,
    user_profiles: undefined
  }));
}

export async function createReview(review: {
  tool_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  review_text: string;
  pros?: string[];
  cons?: string[];
}): Promise<ToolReview | null> {
  const { data, error } = await supabase
    .from('tool_reviews')
    .insert({
      ...review,
      approved: false,
      helpful_count: 0,
      verified_purchase: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return null;
  }

  return data;
}

export async function updateReview(
  reviewId: string,
  updates: Partial<ToolReview>
): Promise<boolean> {
  const { error } = await supabase
    .from('tool_reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId);

  if (error) {
    console.error('Error updating review:', error);
    return false;
  }

  return true;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tool_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting review:', error);
    return false;
  }

  return true;
}

export async function toggleHelpfulVote(
  reviewId: string,
  userId: string
): Promise<boolean> {
  const { data: existingVote } = await supabase
    .from('review_helpful_votes')
    .select('id')
    .eq('review_id', reviewId)
    .eq('voter_id', userId)
    .maybeSingle();

  if (existingVote) {
    const { error } = await supabase
      .from('review_helpful_votes')
      .delete()
      .eq('id', existingVote.id);

    if (error) {
      console.error('Error removing helpful vote:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('review_helpful_votes')
      .insert({
        review_id: reviewId,
        voter_id: userId
      });

    if (error) {
      console.error('Error adding helpful vote:', error);
      return false;
    }
  }

  return true;
}

export async function getUserHelpfulVotes(
  userId: string,
  reviewIds: string[]
): Promise<Set<string>> {
  if (reviewIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from('review_helpful_votes')
    .select('review_id')
    .eq('voter_id', userId)
    .in('review_id', reviewIds);

  if (error) {
    console.error('Error fetching user votes:', error);
    return new Set();
  }

  return new Set(data.map(v => v.review_id));
}

export async function getAllReviews(): Promise<ToolReview[]> {
  const { data, error } = await supabase
    .from('tool_reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }

  return data || [];
}

export async function approveReview(reviewId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tool_reviews')
    .update({ approved: true })
    .eq('id', reviewId);

  if (error) {
    console.error('Error approving review:', error);
    return false;
  }

  return true;
}

export async function getAverageRating(toolId: string): Promise<number> {
  const { data, error } = await supabase
    .from('tool_reviews')
    .select('rating')
    .eq('tool_id', toolId)
    .eq('approved', true);

  if (error || !data || data.length === 0) {
    return 0;
  }

  const sum = data.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / data.length) * 10) / 10;
}
