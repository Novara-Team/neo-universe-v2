import { useState, useEffect } from 'react';
import { useAuth } from '../lib/useAuth';
import {
  getUserReferralData,
  getUserRewards,
  getAllMilestones,
  generateReferralLink,
  getRewardIcon,
  getProgressPercentage,
  getNextMilestone,
  getReferredUsers,
  type ReferralData,
  type ReferralReward,
  type ReferralMilestone,
  type ReferredUser
} from '../lib/referrals';
import { Gift, Share2, Copy, Users, Trophy, Target, Star, Check, Sparkles, TrendingUp, Award, Crown } from 'lucide-react';

export default function Referrals() {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [milestones, setMilestones] = useState<ReferralMilestone[]>([]);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    setLoading(true);

    const [refData, userRewards, allMilestones, users] = await Promise.all([
      getUserReferralData(user.id),
      getUserRewards(user.id),
      getAllMilestones(),
      getReferredUsers(user.id)
    ]);

    setReferralData(refData);
    setRewards(userRewards);
    setMilestones(allMilestones);
    setReferredUsers(users);
    setLoading(false);
  };

  const handleCopyLink = () => {
    if (referralData) {
      const link = generateReferralLink(referralData.referral_code);
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (referralData) {
      const link = generateReferralLink(referralData.referral_code);
      const text = `Join me on AI Universe and discover amazing AI tools! Use my referral link to get started: ${link}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join AI Universe',
            text: text,
            url: link
          });
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        handleCopyLink();
      }
    }
  };

  const nextMilestone = referralData ? getNextMilestone(referralData.total_referrals, milestones) : null;
  const progress = nextMilestone && referralData
    ? getProgressPercentage(referralData.total_referrals, nextMilestone.referrals_count)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium">Loading referral data...</span>
        </div>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Unable to load referral data</p>
        </div>
      </div>
    );
  }

  const referralLink = generateReferralLink(referralData.referral_code);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mb-6 shadow-2xl shadow-cyan-500/50">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Referral Program
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Share AI Universe with friends and earn amazing rewards for every successful referral
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Referrals</p>
                <p className="text-4xl font-bold text-white">{referralData.total_referrals}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">People who joined using your link</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Rewards Earned</p>
                <p className="text-4xl font-bold text-white">{rewards.length}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Milestones you've achieved</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Next Milestone</p>
                <p className="text-4xl font-bold text-white">
                  {nextMilestone ? nextMilestone.referrals_count : '100+'}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {nextMilestone
                ? `${nextMilestone.referrals_count - referralData.total_referrals} more to go`
                : 'All milestones completed!'}
            </p>
          </div>
        </div>

        {nextMilestone && (
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getRewardIcon(nextMilestone.reward_type)}</div>
                <div>
                  <h3 className="text-xl font-bold text-white">{nextMilestone.reward_name}</h3>
                  <p className="text-sm text-slate-400">{nextMilestone.reward_description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-cyan-400">{Math.round(progress)}%</p>
                <p className="text-xs text-slate-500">Progress</p>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-3">
              {referralData.total_referrals} / {nextMilestone.referrals_count} referrals
            </p>
          </div>
        )}

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 shadow-2xl mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Share Your Link</h3>
              <p className="text-sm text-slate-400">Invite friends and earn rewards together</p>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-4 mb-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-cyan-300 font-mono text-sm outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/50 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Link
            </button>
          </div>

          <div className="mt-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
            <p className="text-sm text-cyan-300 text-center font-medium">
              Your Referral Code: <span className="font-bold text-white text-lg">{referralData.referral_code}</span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-7 h-7 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">Your Rewards</h3>
            </div>

            {rewards.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-slate-400">No rewards yet. Start referring to earn!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{getRewardIcon(reward.reward_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white">{reward.reward_name}</h4>
                          {reward.claimed && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                              Claimed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{reward.reward_description}</p>
                        <p className="text-xs text-slate-500">
                          Earned at {reward.referrals_required} referrals
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-7 h-7 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">All Milestones</h3>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {milestones.map((milestone) => {
                const isCompleted = referralData.total_referrals >= milestone.referrals_count;
                const isCurrent = nextMilestone?.id === milestone.id;

                return (
                  <div
                    key={milestone.id}
                    className={`bg-slate-800/50 rounded-2xl p-5 border transition-all ${
                      isCompleted
                        ? 'border-green-500/50 bg-green-500/5'
                        : isCurrent
                        ? 'border-cyan-500/50 bg-cyan-500/5'
                        : 'border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getRewardIcon(milestone.reward_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white">{milestone.reward_name}</h4>
                          {isCompleted && (
                            <Check className="w-5 h-5 text-green-400" />
                          )}
                          {isCurrent && (
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{milestone.reward_description}</p>
                        <p className="text-xs text-slate-500">
                          Requires {milestone.referrals_count} referrals
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {referredUsers.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-7 h-7 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">Your Referrals</h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {referredUsers.map((referredUser) => (
                <div
                  key={referredUser.id}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {referredUser.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{referredUser.email}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(referredUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 shadow-2xl">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg">
                  1
                </div>
                <h4 className="font-bold text-white mb-2">Share Your Link</h4>
                <p className="text-sm text-slate-400">
                  Copy your unique referral link and share it with friends
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg">
                  2
                </div>
                <h4 className="font-bold text-white mb-2">Friends Sign Up</h4>
                <p className="text-sm text-slate-400">
                  When they register using your link, you both benefit
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg">
                  3
                </div>
                <h4 className="font-bold text-white mb-2">Earn Rewards</h4>
                <p className="text-sm text-slate-400">
                  Get badges, features, and subscription upgrades automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
