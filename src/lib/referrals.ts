import { supabase } from './supabase';

export interface ReferralData {
  id: string;
  user_id: string;
  referral_code: string;
  total_referrals: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralTracking {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: string;
  created_at: string;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  reward_type: string;
  reward_name: string;
  reward_description: string;
  referrals_required: number;
  claimed: boolean;
  claimed_at: string | null;
  created_at: string;
}

export interface ReferralMilestone {
  id: string;
  referrals_count: number;
  reward_type: string;
  reward_name: string;
  reward_description: string;
  is_active: boolean;
  created_at: string;
}

export interface ReferredUser {
  id: string;
  email: string;
  created_at: string;
}

export async function getUserReferralData(userId: string): Promise<ReferralData | null> {
  const { data, error } = await supabase
    .from('user_referrals')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching referral data:', error);
    return null;
  }

  return data;
}

export async function getReferralByCode(code: string): Promise<ReferralData | null> {
  const { data, error } = await supabase
    .from('user_referrals')
    .select('*')
    .eq('referral_code', code)
    .maybeSingle();

  if (error) {
    console.error('Error fetching referral by code:', error);
    return null;
  }

  return data;
}

export async function getUserReferrals(userId: string): Promise<ReferralTracking[]> {
  const { data, error } = await supabase
    .from('referral_tracking')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user referrals:', error);
    return [];
  }

  return data || [];
}

export async function getReferredUsers(userId: string): Promise<ReferredUser[]> {
  const referrals = await getUserReferrals(userId);

  if (referrals.length === 0) {
    return [];
  }

  const referredIds = referrals.map(r => r.referred_id);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, created_at')
    .in('id', referredIds);

  if (error) {
    console.error('Error fetching referred users:', error);
    return [];
  }

  return data || [];
}

export async function getUserRewards(userId: string): Promise<ReferralReward[]> {
  const { data, error } = await supabase
    .from('referral_rewards')
    .select('*')
    .eq('user_id', userId)
    .order('referrals_required', { ascending: true });

  if (error) {
    console.error('Error fetching user rewards:', error);
    return [];
  }

  return data || [];
}

export async function getAllMilestones(): Promise<ReferralMilestone[]> {
  const { data, error } = await supabase
    .from('referral_milestones')
    .select('*')
    .eq('is_active', true)
    .order('referrals_count', { ascending: true });

  if (error) {
    console.error('Error fetching milestones:', error);
    return [];
  }

  return data || [];
}

export async function trackReferral(referralCode: string, newUserId: string): Promise<boolean> {
  try {
    const referralData = await getReferralByCode(referralCode);

    if (!referralData) {
      console.error('Invalid referral code');
      return false;
    }

    if (referralData.user_id === newUserId) {
      console.error('Cannot refer yourself');
      return false;
    }

    const existingReferral = await supabase
      .from('referral_tracking')
      .select('*')
      .eq('referred_id', newUserId)
      .maybeSingle();

    if (existingReferral.data) {
      console.error('User already referred');
      return false;
    }

    const { error } = await supabase
      .from('referral_tracking')
      .insert({
        referrer_id: referralData.user_id,
        referred_id: newUserId,
        referral_code: referralCode,
        status: 'completed'
      });

    if (error) {
      console.error('Error tracking referral:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in trackReferral:', error);
    return false;
  }
}

export async function claimReward(rewardId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('referral_rewards')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString()
      })
      .eq('id', rewardId);

    if (error) {
      console.error('Error claiming reward:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in claimReward:', error);
    return false;
  }
}

export function getRewardIcon(rewardType: string): string {
  switch (rewardType) {
    case 'badge':
      return '🏆';
    case 'subscription_upgrade':
      return '⭐';
    case 'feature_unlock':
      return '🔓';
    case 'points':
      return '💎';
    default:
      return '🎁';
  }
}

export function getProgressPercentage(current: number, target: number): number {
  return Math.min((current / target) * 100, 100);
}

export function getNextMilestone(currentReferrals: number, milestones: ReferralMilestone[]): ReferralMilestone | null {
  const nextMilestone = milestones.find(m => m.referrals_count > currentReferrals);
  return nextMilestone || null;
}

export function generateReferralLink(referralCode: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/register?ref=${referralCode}`;
}
