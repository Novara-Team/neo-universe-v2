import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Sparkles, Flame, Rocket, Star, Crown, Lock } from 'lucide-react';
import { supabase, AITool } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';

type RankingType = 'popular' | 'weekly' | 'monthly' | 'trending' | 'rising';

interface RankedTool extends AITool {
  rank?: number;
  score?: number;
}

interface FilterOption {
  id: RankingType;
  label: string;
  icon: React.ReactNode;
  description: string;
  isPremium: boolean;
}

const filterOptions: FilterOption[] = [
  {
    id: 'popular',
    label: 'All-Time Popular',
    icon: <Star className="w-4 h-4" />,
    description: 'Most loved tools based on ratings, favorites & reviews',
    isPremium: false,
  },
  {
    id: 'weekly',
    label: 'Tool of the Week',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Hottest tools trending in the last 7 days',
    isPremium: true,
  },
  {
    id: 'monthly',
    label: 'Tool of the Month',
    icon: <Trophy className="w-4 h-4" />,
    description: 'Top performers over the past 30 days',
    isPremium: true,
  },
  {
    id: 'trending',
    label: 'Trending Now',
    icon: <Flame className="w-4 h-4" />,
    description: 'Rapidly growing tools going viral right now',
    isPremium: true,
  },
  {
    id: 'rising',
    label: 'Rising Stars',
    icon: <Rocket className="w-4 h-4" />,
    description: 'New tools gaining strong early traction',
    isPremium: true,
  },
];

export default function TopTools() {
  const { profile, user } = useAuth();
  const [tools, setTools] = useState<RankedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<RankingType>('popular');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPaidUser = profile?.subscription_plan === 'plus' || profile?.subscription_plan === 'pro';
  const isProUser = profile?.subscription_plan === 'pro';

  useEffect(() => {
    loadTools();
  }, [selectedFilter]);

  const loadTools = async () => {
    setLoading(true);

    if (selectedFilter === 'popular') {
      const { data } = await supabase
        .from('ai_tools')
        .select('*, category:categories(*)')
        .eq('status', 'Published')
        .order('views', { ascending: false })
        .limit(50);

      if (data) {
        setTools(data.map((tool, index) => ({ ...tool, rank: index + 1 })));
      }
    } else {
      const today = new Date().toISOString().split('T')[0];

      const { data: rankings } = await supabase
        .from('tool_rankings')
        .select('tool_id, rank, score')
        .eq('ranking_type', selectedFilter)
        .lte('period_start', today)
        .gte('period_end', today)
        .order('rank', { ascending: true })
        .limit(50);

      if (rankings && rankings.length > 0) {
        const toolIds = rankings.map(r => r.tool_id);

        const { data: toolsData } = await supabase
          .from('ai_tools')
          .select('*, category:categories(*)')
          .in('id', toolIds);

        if (toolsData) {
          const rankedTools = rankings.map(ranking => {
            const tool = toolsData.find(t => t.id === ranking.tool_id);
            return tool ? { ...tool, rank: ranking.rank, score: ranking.score } : null;
          }).filter(Boolean) as RankedTool[];

          setTools(rankedTools);
        }
      } else {
        setTools([]);
      }
    }

    setLoading(false);
  };

  const handleFilterClick = (filterId: RankingType, isPremium: boolean) => {
    if (isPremium && !isPaidUser) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedFilter(filterId);
  };

  const getRankBadgeStyle = (index: number) => {
    if (index === 0) {
      return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 shadow-lg shadow-yellow-500/50';
    } else if (index === 1) {
      return 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-slate-900 shadow-lg shadow-slate-400/50';
    } else if (index === 2) {
      return 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-slate-900 shadow-lg shadow-orange-500/50';
    }
    return 'bg-slate-700/80 text-slate-300 border border-slate-600';
  };

  const currentFilter = filterOptions.find(f => f.id === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
              <div className="scale-90 sm:scale-100">{currentFilter?.icon}</div>
              <span className="text-cyan-400 text-xs sm:text-sm font-medium">{currentFilter?.label}</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2 sm:mb-3 px-4">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Top AI Tools
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg text-center max-w-2xl mx-auto px-4">
            {currentFilter?.description}
          </p>
        </div>

        <div className="mb-6 sm:mb-8 -mx-4 sm:mx-0">
          <div className="overflow-x-auto scrollbar-hide px-4">
            <div className="flex space-x-2 sm:space-x-3 min-w-max sm:justify-center pb-2">
              {filterOptions.map((filter) => {
                const isLocked = filter.isPremium && !isPaidUser;
                const isActive = selectedFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterClick(filter.id, filter.isPremium)}
                    className={`group relative flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                        : isLocked
                        ? 'bg-slate-800/50 border border-slate-700/50 text-slate-500 hover:border-slate-600'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-white hover:shadow-md hover:shadow-cyan-500/20'
                    }`}
                  >
                    <span className="scale-90 sm:scale-100">{filter.icon}</span>
                    <span className="whitespace-nowrap text-xs sm:text-sm">{filter.label}</span>
                    {isLocked && (
                      <>
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-900" />
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isProUser && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm sm:text-base">Universe Master Access</p>
                <p className="text-slate-400 text-xs sm:text-sm">You have access to all premium ranking filters with advanced algorithms</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 sm:py-20 animate-in fade-in duration-500">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute animate-ping rounded-full h-16 w-16 sm:h-20 sm:w-20 bg-cyan-500/30"></div>
              <div className="relative animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-cyan-500/20 border-t-cyan-500 shadow-lg shadow-cyan-500/20"></div>
            </div>
            <p className="text-slate-400 mt-4 sm:mt-6 text-base sm:text-lg px-4 font-medium">Loading {currentFilter?.label.toLowerCase()}...</p>
            <div className="flex justify-center mt-3 space-x-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Rankings Available Yet</h3>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
              Rankings for this category will be available once we have enough data. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {tools.map((tool, index) => (
              <Link
                key={tool.id}
                to={`/tool/${tool.slug}`}
                className="group block bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:border-cyan-500/50 hover:bg-slate-800/60 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
              >
                <div className="flex items-start space-x-3 sm:space-x-5">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg transition-transform group-hover:scale-110 ${getRankBadgeStyle(index)}`}
                    >
                      {index < 3 ? <Trophy className="w-5 h-5 sm:w-7 sm:h-7" /> : tool.rank || index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                        {tool.logo_url ? (
                          <img
                            src={tool.logo_url}
                            alt={tool.name}
                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover border border-slate-600 group-hover:border-cyan-500/50 transition-colors flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-slate-600 group-hover:border-cyan-400 transition-colors flex-shrink-0">
                            <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-0.5 sm:mb-1 truncate">
                            {tool.name}
                          </h3>
                          <p className="text-slate-400 text-xs sm:text-sm truncate">{tool.category?.name}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0">
                        {tool.rating > 0 && (
                          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded px-1.5 py-0.5 sm:px-3 sm:py-1">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold text-yellow-400 text-xs sm:text-base">{tool.rating.toFixed(1)}</span>
                          </div>
                        )}
                        <span className="text-slate-500 text-xs sm:text-sm font-medium whitespace-nowrap">{tool.views.toLocaleString()}</span>
                        {tool.score && tool.score > 0 && (
                          <span className="text-cyan-400 text-xs font-mono bg-cyan-500/10 px-1.5 sm:px-2 py-0.5 rounded hidden sm:inline">
                            Score: {tool.score.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm sm:text-base mb-2 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">{tool.description}</p>

                    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-medium rounded">
                        {tool.pricing_type}
                      </span>
                      {tool.tags.slice(0, window.innerWidth < 640 ? 2 : 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 text-xs sm:text-sm rounded hover:bg-slate-700 hover:border-slate-500 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Feature</h3>
              <p className="text-slate-400">
                Upgrade to Creator or Universe Master to unlock advanced ranking filters and discover tools in smarter ways.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start space-x-3 text-sm">
                <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300">Tool of the Week based on 7-day trends</p>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <Trophy className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300">Tool of the Month with 30-day analytics</p>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <Flame className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300">Trending tools going viral right now</p>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <Rocket className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300">Rising stars with strong early traction</p>
              </div>
            </div>

            {user ? (
              <Link
                to="/pricing"
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center font-semibold py-3 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30"
              >
                View Pricing Plans
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center font-semibold py-3 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30"
              >
                Sign In to Upgrade
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
