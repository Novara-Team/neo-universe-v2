import { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink, Plus, X, TrendingUp, Calendar, Eye, Star, DollarSign, Check, Minus, Crown, Zap, Loader2, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, AITool } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { trackEvent } from '../lib/analytics';

export default function CompareAdvanced() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState<AITool[]>([]);
  const [selectedTools, setSelectedTools] = useState<AITool[]>([]);
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [analysisQuestion, setAnalysisQuestion] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!user || (profile && profile.subscription_plan === 'free')) {
      navigate('/compare');
    } else {
      loadTools();
    }
  }, [user, profile]);

  const loadTools = async () => {
    const { data } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('status', 'Published')
      .order('views', { ascending: false })
      .limit(200);

    if (data) setTools(data);
  };

  const filteredTools = tools.filter((t) =>
    !selectedTools.find((st) => st.id === t.id) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const addTool = (tool: AITool) => {
    if (selectedTools.length < 5) {
      setSelectedTools([...selectedTools, tool]);
      setSearch('');
      setShowResults(false);

      if (selectedTools.length > 0) {
        trackEvent('tool_compare', {
          tool_ids: [...selectedTools.map(t => t.id), tool.id],
          tool_names: [...selectedTools.map(t => t.name), tool.name]
        });
      }
    }
  };

  const removeTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
  };

  const getWinner = (metric: string): string | null => {
    if (selectedTools.length < 2) return null;

    switch (metric) {
      case 'rating':
        const maxRating = Math.max(...selectedTools.map((t) => t.rating));
        return selectedTools.find((t) => t.rating === maxRating)?.id || null;
      case 'views':
        const maxViews = Math.max(...selectedTools.map((t) => t.views));
        return selectedTools.find((t) => t.views === maxViews)?.id || null;
      case 'features':
        const maxFeatures = Math.max(...selectedTools.map((t) => t.features.length));
        return selectedTools.find((t) => t.features.length === maxFeatures)?.id || null;
      default:
        return null;
    }
  };

  const allFeatures = Array.from(
    new Set(selectedTools.flatMap((t) => t.features))
  );

  const allTags = Array.from(
    new Set(selectedTools.flatMap((t) => t.tags))
  );

  const getAiAnalysis = async () => {
    if (selectedTools.length < 2) return;

    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-compare`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tools: selectedTools,
          question: analysisQuestion || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI analysis');
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      setAiAnalysis('Failed to generate analysis. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user || (profile && profile.subscription_plan === 'free')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold text-white">Advanced Compare</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  PREMIUM
                </span>
              </div>
              <p className="text-slate-400 text-lg">
                Compare up to 5 AI tools side-by-side with advanced metrics and detailed analysis
              </p>
            </div>
            <Link
              to="/compare"
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Basic Compare
            </Link>
          </div>
        </div>

        <div className="mb-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Selected Tools ({selectedTools.length}/5)
            </h2>
            <div className="text-sm text-slate-400">
              {selectedTools.length < 2 && 'Add at least 2 tools to compare'}
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search and add tools to compare..."
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {showResults && search && filteredTools.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredTools.slice(0, 10).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => addTool(tool)}
                    disabled={selectedTools.length >= 5}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      {tool.logo_url ? (
                        <img src={tool.logo_url} alt={tool.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">{tool.name}</div>
                        <div className="text-slate-400 text-sm">{tool.pricing_type}</div>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-cyan-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedTools.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg"
                >
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  )}
                  <span className="text-white font-medium">{tool.name}</span>
                  <button
                    onClick={() => removeTool(tool.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedTools.length >= 2 ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">
                  AI-Powered Analysis
                </h2>
              </div>
              <p className="text-slate-300 mb-4">
                Get comprehensive AI-powered insights comparing all selected tools. Ask a specific question or get a general comparison.
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={analysisQuestion}
                    onChange={(e) => setAnalysisQuestion(e.target.value)}
                    placeholder="Ask a specific question (optional)..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <button
                  onClick={getAiAnalysis}
                  disabled={isAnalyzing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate AI Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {aiAnalysis && (
                <div className="mt-6 p-6 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span>AI Analysis Results</span>
                  </h3>
                  <div className="prose prose-invert prose-slate max-w-none">
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {aiAnalysis}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Stats Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Metric</th>
                      {selectedTools.map((tool) => (
                        <th key={tool.id} className="text-center py-3 px-4 text-white font-medium min-w-[150px]">
                          <div className="flex flex-col items-center space-y-2">
                            {tool.logo_url ? (
                              <img src={tool.logo_url} alt={tool.name} className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <Sparkles className="w-10 h-10 text-cyan-400" />
                            )}
                            <span className="text-sm">{tool.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>Rating</span>
                      </td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className={`py-4 px-4 text-center ${getWinner('rating') === tool.id ? 'bg-green-500/10' : ''}`}>
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-white font-semibold">{tool.rating.toFixed(1)}</span>
                            {getWinner('rating') === tool.id && <Crown className="w-4 h-4 text-yellow-400 ml-2" />}
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>Views</span>
                      </td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className={`py-4 px-4 text-center ${getWinner('views') === tool.id ? 'bg-green-500/10' : ''}`}>
                          <div className="flex items-center justify-center">
                            <span className="text-white font-semibold">{tool.views.toLocaleString()}</span>
                            {getWinner('views') === tool.id && <Crown className="w-4 h-4 text-yellow-400 ml-2" />}
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span>Pricing</span>
                      </td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            tool.pricing_type === 'Free' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            tool.pricing_type === 'Freemium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {tool.pricing_type}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Launch Date</span>
                      </td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="py-4 px-4 text-center">
                          <span className="text-white">{new Date(tool.launch_date).toLocaleDateString()}</span>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span>Feature Count</span>
                      </td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className={`py-4 px-4 text-center ${getWinner('features') === tool.id ? 'bg-green-500/10' : ''}`}>
                          <div className="flex items-center justify-center">
                            <span className="text-white font-semibold">{tool.features.length}</span>
                            {getWinner('features') === tool.id && <Crown className="w-4 h-4 text-yellow-400 ml-2" />}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {allFeatures.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Feature Comparison Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                        {selectedTools.map((tool) => (
                          <th key={tool.id} className="text-center py-3 px-4 text-white font-medium min-w-[120px]">
                            {tool.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allFeatures.map((feature, idx) => (
                        <tr key={idx} className="border-b border-slate-700/50">
                          <td className="py-3 px-4 text-slate-300">{feature}</td>
                          {selectedTools.map((tool) => (
                            <td key={tool.id} className="py-3 px-4 text-center">
                              {tool.features.includes(feature) ? (
                                <Check className="w-5 h-5 text-green-400 mx-auto" />
                              ) : (
                                <Minus className="w-5 h-5 text-slate-600 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Detailed Information</h3>
              <div className="grid grid-cols-1 gap-6">
                {selectedTools.map((tool) => (
                  <div key={tool.id} className="border border-slate-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {tool.logo_url ? (
                          <img src={tool.logo_url} alt={tool.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <Sparkles className="w-12 h-12 text-cyan-400" />
                        )}
                        <div>
                          <h4 className="text-xl font-bold text-white">{tool.name}</h4>
                          <p className="text-slate-400">{tool.pricing_type}</p>
                        </div>
                      </div>
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-sm"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className="text-slate-300 mb-4">{tool.description}</p>

                    {tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tool.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-700/50 text-slate-400 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">Add at least 2 tools to start comparing</p>
            <p className="text-slate-500">You can compare up to 5 tools at once</p>
          </div>
        )}
      </div>
    </div>
  );
}
