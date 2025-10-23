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
  claimReward,
  type ReferralData,
  type ReferralReward,
  type ReferralMilestone,
  type ReferredUser
} from '../lib/referrals';
import { Gift, Share2, Copy, Users, Trophy, Target, Check, Sparkles, TrendingUp, Award, Crown, Zap, Star, Heart } from 'lucide-react';

export default function Referrals() {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [milestones, setMilestones] = useState<ReferralMilestone[]>([]);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

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

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    const success = await claimReward(rewardId);

    if (success) {
      setRewards(rewards.map(r =>
        r.id === rewardId ? { ...r, claimed: true, claimed_at: new Date().toISOString() } : r
      ));
    } else {
      alert('Failed to claim reward. Please try again.');
    }

    setClaimingReward(null);
  };

  const nextMilestone = referralData ? getNextMilestone(referralData.total_referrals, milestones) : null;
  const progress = nextMilestone && referralData
    ? getProgressPercentage(referralData.total_referrals, nextMilestone.referrals_count)
    : 0;

  const instantRewards = rewards.filter(r => r.referrals_required === 0);
  const milestoneRewards = rewards.filter(r => r.referrals_required > 0);

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-3xl mb-6 shadow-2xl shadow-cyan-500/50 animate-pulse">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Earn Rewards Together
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Share AI Universe and both you and your friends earn instant rewards. More referrals unlock even bigger bonuses!
          </p>
        </div>

        <div className="mb-12 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-emerald-400" />
                <h3 className="text-3xl font-bold text-white">Instant Rewards</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Gift className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">You Get 50 Points</p>
                    <p className="text-sm text-slate-400">When someone uses your referral link</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Your Friend Gets 25 Points</p>
                    <p className="text-sm text-slate-400">Welcome bonus for joining through your link</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full mb-3 shadow-2xl shadow-emerald-500/50">
                <span className="text-5xl font-bold text-white">{instantRewards.length}</span>
              </div>
              <p className="text-slate-300 font-semibold">Instant Rewards Earned</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">{referralData.total_referrals}</p>
                <p className="text-xs text-slate-400 font-medium">Total Referrals</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">People who joined using your link</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">{milestoneRewards.length}</p>
                <p className="text-xs text-slate-400 font-medium">Milestones</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">Achievement rewards unlocked</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">
                  {nextMilestone ? nextMilestone.referrals_count : '200+'}
                </p>
                <p className="text-xs text-slate-400 font-medium">Next Goal</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              {nextMilestone
                ? `${nextMilestone.referrals_count - referralData.total_referrals} more to go`
                : 'All achieved!'}
            </p>
          </div>
        </div>

        {nextMilestone && (
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl animate-bounce">{getRewardIcon(nextMilestone.reward_type)}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">{nextMilestone.reward_name}</h3>
                <p className="text-slate-300">{nextMilestone.reward_description}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </p>
                <p className="text-xs text-slate-500 uppercase font-semibold">Progress</p>
              </div>
            </div>
            <div className="relative w-full bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/50">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-full transition-all duration-700 shadow-lg shadow-emerald-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-4 text-center">
              {referralData.total_referrals} / {nextMilestone.referrals_count} referrals completed
            </p>
          </div>
        )}

        <div className="bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/20 shadow-2xl mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Your Referral Link</h3>
              <p className="text-sm text-slate-400">Share this link to start earning rewards</p>
            </div>
          </div>

          <div className="bg-slate-900/70 rounded-2xl p-5 mb-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-slate-800/50 text-emerald-300 font-mono text-sm px-4 py-3 rounded-xl outline-none border border-slate-700/50 focus:border-emerald-500/50 transition-all"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
          >
            <Share2 className="w-6 h-6" />
            Share with Friends
          </button>

          <div className="mt-6 p-5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/30">
            <p className="text-center">
              <span className="text-slate-300">Your Referral Code:</span>
              <span className="ml-3 font-bold text-white text-2xl tracking-wider">{referralData.referral_code}</span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-emerald-400" />
              <h3 className="text-2xl font-bold text-white">Your Rewards</h3>
            </div>

            {rewards.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-12 h-12 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg">No rewards yet</p>
                <p className="text-slate-500 text-sm mt-2">Start sharing to earn your first reward!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{getRewardIcon(reward.reward_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-white text-lg">{reward.reward_name}</h4>
                          {reward.claimed ? (
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full whitespace-nowrap">
                              Claimed
                            </span>
                          ) : referralData && referralData.total_referrals >= reward.referrals_required ? (
                            <button
                              onClick={() => handleClaimReward(reward.id)}
                              disabled={claimingReward === reward.id}
                              className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-xs font-semibold rounded-full whitespace-nowrap transition-all disabled:opacity-50"
                            >
                              {claimingReward === reward.id ? 'Claiming...' : 'Claim'}
                            </button>
                          ) : (
                            <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-xs font-semibold rounded-full whitespace-nowrap">
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{reward.reward_description}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          {reward.referrals_required === 0 ? (
                            <>
                              <Zap className="w-3 h-3" />
                              Instant reward
                            </>
                          ) : (
                            <>
                              <Star className="w-3 h-3" />
                              Earned at {reward.referrals_required} referrals
                            </>
                          )}
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
              <Crown className="w-8 h-8 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">All Milestones</h3>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {milestones.map((milestone) => {
                const isCompleted = referralData.total_referrals >= milestone.referrals_count;
                const isCurrent = nextMilestone?.id === milestone.id;

                return (
                  <div
                    key={milestone.id}
                    className={`bg-slate-800/50 rounded-2xl p-5 border transition-all ${
                      isCompleted
                        ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                        : isCurrent
                        ? 'border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{getRewardIcon(milestone.reward_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-white">{milestone.reward_name}</h4>
                          {isCompleted && (
                            <Check className="w-5 h-5 text-emerald-400" />
                          )}
                          {isCurrent && (
                            <TrendingUp className="w-5 h-5 text-cyan-400 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{milestone.reward_description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500">
                            Requires {milestone.referrals_count} referrals
                          </p>
                          {isCompleted && (
                            <span className="text-xs text-emerald-400 font-semibold">Completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {referredUsers.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">Your Referrals ({referredUsers.length})</h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {referredUsers.map((referredUser) => (
                <div
                  key={referredUser.id}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
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

        <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-10 border border-emerald-500/30 shadow-2xl">
          <div className="text-center">
            <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8 mt-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl">
                  1
                </div>
                <h4 className="font-bold text-white mb-3 text-lg">Share Your Link</h4>
                <p className="text-slate-300 leading-relaxed">
                  Copy your unique referral link and share it with friends on social media or messaging apps
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl">
                  2
                </div>
                <h4 className="font-bold text-white mb-3 text-lg">Instant Rewards</h4>
                <p className="text-slate-300 leading-relaxed">
                  When they sign up, you both get instant points. You get 50 points, they get 25 points!
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl">
                  3
                </div>
                <h4 className="font-bold text-white mb-3 text-lg">Unlock Milestones</h4>
                <p className="text-slate-300 leading-relaxed">
                  Reach referral milestones to earn badges, feature unlocks, and subscription upgrades
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
