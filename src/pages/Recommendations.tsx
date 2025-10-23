import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, RefreshCw, Lock, TrendingUp, Zap, Target, Layers, Filter } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getRecommendations,
  generateRecommendations,
  getEmergingTools,
  getUserContext,
  ToolRecommendation
} from '../lib/recommendations';

export default function Recommendations() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [emergingTools, setEmergingTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [userContext, setUserContext] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (profile && profile.subscription_plan !== 'pro') {
      return;
    }

    loadData();
  }, [user, profile, filterType]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    const [recsData, emergingData, contextData] = await Promise.all([
      getRecommendations(user.id, filterType === 'all' ? undefined : filterType),
      getEmergingTools(),
      getUserContext(user.id),
    ]);

    setRecommendations(recsData);
    setEmergingTools(emergingData);
    setUserContext(contextData);
    setLoading(false);
  };

  const handleGenerateRecommendations = async () => {
    if (!user) return;

    setGenerating(true);
    await generateRecommendations(user.id);
    await loadData();
    setGenerating(false);
  };

  if (!profile || profile.subscription_plan !== 'pro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Pro Feature</h2>
            <p className="text-slate-300 mb-8 text-lg">
              AI-powered tool recommendations are exclusive to Pro members. Upgrade your plan to get personalized suggestions based on your interests.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
            >
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getRecommendationTypeLabel = (type: string) => {
    switch (type) {
      case 'emerging':
        return { label: 'Trending', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'context-based':
        return { label: 'For You', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      default:
        return { label: 'Recommended', icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">AI Recommendations 2.0</h1>
              </div>
              <p className="text-slate-400 text-lg">
                Personalized tool suggestions powered by deep learning and context analysis
              </p>
            </div>
            <button
              onClick={handleGenerateRecommendations}
              disabled={generating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating...' : 'Refresh'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{recommendations.length}</span>
              </div>
              <p className="text-slate-300 font-medium">Personalized</p>
              <p className="text-slate-500 text-sm">Recommendations</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{emergingTools.length}</span>
              </div>
              <p className="text-slate-300 font-medium">Emerging</p>
              <p className="text-slate-500 text-sm">Tools</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Layers className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {recommendations.filter(r => r.context_score && r.context_score > 15).length}
                </span>
              </div>
              <p className="text-slate-300 font-medium">Context</p>
              <p className="text-slate-500 text-sm">Matched</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length) || 0}
                </span>
              </div>
              <p className="text-slate-300 font-medium">Avg Match</p>
              <p className="text-slate-500 text-sm">Score</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2">
            <div className="flex items-center space-x-2 text-slate-400 flex-shrink-0">
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('emerging')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filterType === 'emerging'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Trending
            </button>
            <button
              onClick={() => setFilterType('context-based')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filterType === 'context-based'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Target className="w-4 h-4 inline mr-1" />
              For You
            </button>
            <button
              onClick={() => setFilterType('general')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filterType === 'general'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              Popular
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="text-slate-400 mt-4">Loading recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
            <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-4">No Recommendations Yet</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Start exploring and interacting with AI tools to get personalized recommendations. View tools, add favorites, and we'll suggest similar tools you might like.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/explore"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
              >
                <span>Explore Tools</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={handleGenerateRecommendations}
                disabled={generating}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                <span>Generate Now</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => {
              const typeInfo = getRecommendationTypeLabel(rec.recommendation_type || 'general');
              const Icon = typeInfo.icon;

              return (
                <Link
                  key={rec.id}
                  to={`/tool/${rec.tool?.slug}`}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        {rec.tool?.logo_url ? (
                          <img
                            src={rec.tool.logo_url}
                            alt={rec.tool.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {rec.tool?.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-slate-400">{rec.tool?.pricing_type}</span>
                            <span className="text-slate-600">•</span>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-sm text-slate-400">{rec.tool?.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">{rec.tool?.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 ${typeInfo.bg} rounded-lg`}>
                          <Icon className={`w-4 h-4 ${typeInfo.color}`} />
                        </div>
                        <span className={`text-sm font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-cyan-400">
                        {Math.round(rec.score)}% match
                      </span>
                    </div>

                    {rec.reason && (
                      <p className="text-xs text-slate-500 italic mb-4 line-clamp-2">{rec.reason}</p>
                    )}

                    {rec.tool?.tags && rec.tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {rec.tool.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-700/50 text-cyan-400 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {rec.tool?.category?.name || 'General'}
                    </span>
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      {rec.context_score && rec.context_score > 0 && (
                        <span className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{rec.context_score}</span>
                        </span>
                      )}
                      {rec.trend_score && rec.trend_score > 0 && (
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{rec.trend_score}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
