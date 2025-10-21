import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import {
  getRecommendations,
  generateRecommendations,
  ToolRecommendation
} from '../lib/recommendations';

export default function Recommendations() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (profile && profile.subscription_plan !== 'pro') {
      return;
    }

    loadRecommendations();
  }, [user, profile]);

  const loadRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getRecommendations(user.id);
    setRecommendations(data);
    setLoading(false);
  };

  const handleGenerateRecommendations = async () => {
    if (!user) return;

    setGenerating(true);
    await generateRecommendations(user.id);
    await loadRecommendations();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Sparkles className="w-8 h-8 text-cyan-400" />
                <h1 className="text-4xl font-bold text-white">AI Recommendations</h1>
              </div>
              <p className="text-slate-400 text-lg">
                Personalized tool suggestions based on your interests and activity
              </p>
            </div>
            <button
              onClick={handleGenerateRecommendations}
              disabled={generating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating...' : 'Refresh Recommendations'}</span>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  to={`/tool/${rec.tool?.slug}`}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    {rec.tool?.logo_url ? (
                      <img
                        src={rec.tool.logo_url}
                        alt={rec.tool.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
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

                  <p className="text-slate-300 mb-4 line-clamp-2">{rec.tool?.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-cyan-400">
                        {Math.round(rec.score)}% match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic">{rec.reason}</p>

                  {rec.tool?.tags && rec.tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
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
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
