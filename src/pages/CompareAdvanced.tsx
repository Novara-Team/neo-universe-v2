import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ExternalLink, Plus, X, TrendingUp, Calendar, Eye, Star, DollarSign, Check, Minus, Crown, Zap, Loader2, MessageSquare, ThumbsUp, Activity, Users, Target, BarChart3, PieChart, LineChart, BarChart2, TrendingDown, Award } from 'lucide-react';
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
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div>
              <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Advanced Compare</h1>
                <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  PREMIUM
                </span>
              </div>
              <p className="text-slate-400 text-sm sm:text-base md:text-lg">
                Compare up to 5 AI tools side-by-side with advanced metrics and detailed analysis
              </p>
            </div>
            <Link
              to="/compare"
              className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm underline flex-shrink-0"
            >
              Basic Compare
            </Link>
          </div>
        </div>

        <div className="mb-6 sm:mb-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Selected Tools ({selectedTools.length}/5)
            </h2>
            <div className="text-xs sm:text-sm text-slate-400">
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
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-900/50 border border-slate-700 rounded-lg"
                >
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover" />
                  ) : (
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  )}
                  <span className="text-white font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{tool.name}</span>
                  <button
                    onClick={() => removeTool(tool.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedTools.length >= 2 ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  AI-Powered Analysis
                </h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base mb-3 sm:mb-4">
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
                <div className="mt-6 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl animate-pulse">
                        <Sparkles className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">AI Analysis Results</h3>
                        <p className="text-sm text-cyan-400">Powered by Advanced AI</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-green-400 text-sm font-semibold">Generated</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                    <div className="prose prose-invert prose-slate max-w-none">
                      <div className="text-slate-200 leading-relaxed space-y-4">
                        {aiAnalysis.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.trim().startsWith('###')) {
                            return (
                              <h4 key={idx} className="text-xl font-bold text-cyan-400 mt-6 mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                                {paragraph.replace('###', '').trim()}
                              </h4>
                            );
                          } else if (paragraph.trim().startsWith('**')) {
                            return (
                              <div key={idx} className="flex items-start gap-3 p-4 bg-cyan-500/5 border-l-4 border-cyan-500 rounded-r-lg">
                                <Award className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                                <p className="text-slate-300 font-semibold">{paragraph.replace(/\*\*/g, '')}</p>
                              </div>
                            );
                          } else if (paragraph.trim().startsWith('-')) {
                            return (
                              <div key={idx} className="flex items-start gap-3 ml-4">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                                <p className="text-slate-300">{paragraph.substring(1).trim()}</p>
                              </div>
                            );
                          } else {
                            return (
                              <p key={idx} className="text-slate-300 leading-relaxed">
                                {paragraph}
                              </p>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Check className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-sm font-bold text-green-400">STRENGTHS</span>
                      </div>
                      <p className="text-xs text-slate-400">Comprehensive analysis of key advantages</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-sm font-bold text-amber-400">INSIGHTS</span>
                      </div>
                      <p className="text-xs text-slate-400">Data-driven comparison metrics</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Target className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm font-bold text-blue-400">RECOMMENDATIONS</span>
                      </div>
                      <p className="text-xs text-slate-400">AI-powered suggestions</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-cyan-400 font-semibold mb-1">Want more specific insights?</p>
                        <p className="text-xs text-slate-400">Ask a specific question above and regenerate the analysis for targeted comparisons.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Quick Stats Comparison</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-400 font-medium text-xs sm:text-sm sticky left-0 bg-slate-800/95 z-10">Metric</th>
                      {selectedTools.map((tool) => (
                        <th key={tool.id} className="text-center py-2 sm:py-3 px-2 sm:px-4 text-white font-medium min-w-[100px] sm:min-w-[150px]">
                          <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                            {tool.logo_url ? (
                              <img src={tool.logo_url} alt={tool.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover" />
                            ) : (
                              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                            )}
                            <span className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{tool.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 sm:py-4 px-2 sm:px-4 text-slate-300 sticky left-0 bg-slate-800/95 z-10">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                          <span className="text-xs sm:text-sm">Rating</span>
                        </div>
                      </td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className={`py-2 sm:py-4 px-2 sm:px-4 text-center ${getWinner('rating') === tool.id ? 'bg-green-500/10' : ''}`}>
                          <div className="flex items-center justify-center space-x-0.5 sm:space-x-1">
                            <span className="text-yellow-400 text-sm sm:text-base">★</span>
                            <span className="text-white font-semibold text-xs sm:text-sm">{tool.rating.toFixed(1)}</span>
                            {getWinner('rating') === tool.id && <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 ml-1 sm:ml-2" />}
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

                    <tr className="border-b border-slate-700/50">
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

                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span>Performance Score</span>
                      </td>
                      {selectedTools.map((tool) => {
                        const performanceScore = Math.min(100, Math.round((tool.views / 1000 + tool.rating * 10) / 2));
                        const maxScore = Math.max(...selectedTools.map(t => Math.min(100, Math.round((t.views / 1000 + t.rating * 10) / 2))));
                        return (
                          <td key={tool.id} className={`py-4 px-4 text-center ${performanceScore === maxScore ? 'bg-green-500/10' : ''}`}>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <span className="text-white font-semibold">{performanceScore}/100</span>
                                <div className="w-20 h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                    style={{ width: `${performanceScore}%` }}
                                  />
                                </div>
                              </div>
                              {performanceScore === maxScore && <Crown className="w-4 h-4 text-yellow-400 ml-2" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <ThumbsUp className="w-4 h-4 text-blue-400" />
                        <span>User Satisfaction</span>
                      </td>
                      {selectedTools.map((tool) => {
                        const satisfaction = Math.round((tool.rating / 5) * 100);
                        const maxSatisfaction = Math.max(...selectedTools.map(t => Math.round((t.rating / 5) * 100)));
                        return (
                          <td key={tool.id} className={`py-4 px-4 text-center ${satisfaction === maxSatisfaction ? 'bg-green-500/10' : ''}`}>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <span className="text-white font-semibold">{satisfaction}%</span>
                                <span className={`text-xs mt-1 ${
                                  satisfaction >= 90 ? 'text-green-400' :
                                  satisfaction >= 70 ? 'text-blue-400' :
                                  satisfaction >= 50 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {satisfaction >= 90 ? 'Excellent' :
                                   satisfaction >= 70 ? 'Very Good' :
                                   satisfaction >= 50 ? 'Good' : 'Average'}
                                </span>
                              </div>
                              {satisfaction === maxSatisfaction && <Crown className="w-4 h-4 text-yellow-400 ml-2" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>Popularity Index</span>
                      </td>
                      {selectedTools.map((tool) => {
                        const popularityIndex = Math.min(100, Math.round(tool.views / 100));
                        const maxPopularity = Math.max(...selectedTools.map(t => Math.min(100, Math.round(t.views / 100))));
                        return (
                          <td key={tool.id} className={`py-4 px-4 text-center ${popularityIndex === maxPopularity ? 'bg-green-500/10' : ''}`}>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <span className="text-white font-semibold">{popularityIndex}/100</span>
                                <div className="w-20 h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                                    style={{ width: `${popularityIndex}%` }}
                                  />
                                </div>
                              </div>
                              {popularityIndex === maxPopularity && <Crown className="w-4 h-4 text-yellow-400 ml-2" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="py-4 px-4 text-slate-300 flex items-center space-x-2">
                        <Target className="w-4 h-4 text-orange-400" />
                        <span>Overall Score</span>
                      </td>
                      {selectedTools.map((tool) => {
                        const overallScore = Math.round(
                          (tool.rating / 5 * 30) +
                          (Math.min(tool.views / 100, 100) * 0.3) +
                          (tool.features.length * 2) +
                          (tool.pricing_type === 'Free' ? 10 : tool.pricing_type === 'Freemium' ? 5 : 0)
                        );
                        const maxOverall = Math.max(...selectedTools.map(t => Math.round(
                          (t.rating / 5 * 30) +
                          (Math.min(t.views / 100, 100) * 0.3) +
                          (t.features.length * 2) +
                          (t.pricing_type === 'Free' ? 10 : t.pricing_type === 'Freemium' ? 5 : 0)
                        )));
                        return (
                          <td key={tool.id} className={`py-4 px-4 text-center ${overallScore === maxOverall ? 'bg-green-500/10' : ''}`}>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <span className="text-white font-bold text-lg">{overallScore}</span>
                                <div className="w-24 h-3 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-full"
                                    style={{ width: `${Math.min(100, overallScore)}%` }}
                                  />
                                </div>
                              </div>
                              {overallScore === maxOverall && <Crown className="w-4 h-4 text-yellow-400 ml-2" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {allFeatures.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Feature Comparison Matrix</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
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

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                <span>Interactive Comparison Graphs</span>
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span>Rating Distribution</span>
                  </h4>
                  <div className="space-y-3">
                    {selectedTools.map((tool) => {
                      const ratingPercentage = (tool.rating / 5) * 100;
                      const isTop = tool.rating === Math.max(...selectedTools.map(t => t.rating));
                      return (
                        <div key={tool.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              {tool.logo_url ? (
                                <img src={tool.logo_url} alt={tool.name} className="w-5 h-5 rounded object-cover" />
                              ) : (
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                              )}
                              <span className="text-slate-300 font-medium">{tool.name}</span>
                              {isTop && <Award className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <span className="text-white font-bold">{tool.rating.toFixed(1)}</span>
                          </div>
                          <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden">
                            <div
                              className={`h-full transition-all duration-700 ${isTop ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                              style={{ width: `${ratingPercentage}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold drop-shadow-lg">{ratingPercentage.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    <span>Popularity Metrics</span>
                  </h4>
                  <div className="space-y-3">
                    {selectedTools
                      .sort((a, b) => b.views - a.views)
                      .map((tool) => {
                        const maxViews = Math.max(...selectedTools.map(t => t.views));
                        const viewsPercentage = (tool.views / maxViews) * 100;
                        const isTop = tool.views === maxViews;
                        return (
                          <div key={tool.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                {tool.logo_url ? (
                                  <img src={tool.logo_url} alt={tool.name} className="w-5 h-5 rounded object-cover" />
                                ) : (
                                  <Sparkles className="w-5 h-5 text-cyan-400" />
                                )}
                                <span className="text-slate-300 font-medium">{tool.name}</span>
                                {isTop && <TrendingUp className="w-4 h-4 text-green-400" />}
                              </div>
                              <span className="text-white font-bold">{(tool.views / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden">
                              <div
                                className={`h-full transition-all duration-700 ${isTop ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                                style={{ width: `${viewsPercentage}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-xs font-bold drop-shadow-lg">{viewsPercentage.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span>Performance Radar</span>
                  </h4>
                  <div className="flex items-center justify-center h-64">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <defs>
                        {selectedTools.map((tool, idx) => (
                          <linearGradient key={`gradient-${idx}`} id={`tool-gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={idx === 0 ? '#06b6d4' : idx === 1 ? '#8b5cf6' : idx === 2 ? '#f59e0b' : idx === 3 ? '#10b981' : '#ec4899'} />
                            <stop offset="100%" stopColor={idx === 0 ? '#3b82f6' : idx === 1 ? '#6366f1' : idx === 2 ? '#f97316' : idx === 3 ? '#059669' : '#db2777'} />
                          </linearGradient>
                        ))}
                      </defs>
                      <g transform="translate(100, 100)">
                        <circle cx="0" cy="0" r="80" fill="none" stroke="#1e293b" strokeWidth="1" />
                        <circle cx="0" cy="0" r="60" fill="none" stroke="#1e293b" strokeWidth="1" />
                        <circle cx="0" cy="0" r="40" fill="none" stroke="#1e293b" strokeWidth="1" />
                        <circle cx="0" cy="0" r="20" fill="none" stroke="#1e293b" strokeWidth="1" />
                        {selectedTools.map((tool, idx) => {
                          const angle = (idx / selectedTools.length) * 2 * Math.PI - Math.PI / 2;
                          const performanceScore = Math.min(100, (tool.rating / 5 * 30) + (tool.views / 1000) + (tool.features.length * 2));
                          const radius = (performanceScore / 100) * 80;
                          const x = radius * Math.cos(angle);
                          const y = radius * Math.sin(angle);
                          return (
                            <g key={tool.id}>
                              <line x1="0" y1="0" x2={x} y2={y} stroke={`url(#tool-gradient-${idx})`} strokeWidth="2" opacity="0.7" />
                              <circle cx={x} cy={y} r="4" fill={`url(#tool-gradient-${idx})`} />
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {selectedTools.map((tool, idx) => (
                      <div key={tool.id} className="flex items-center space-x-1 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: idx === 0 ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : idx === 1 ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : idx === 2 ? 'linear-gradient(135deg, #f59e0b, #f97316)' : idx === 3 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ec4899, #db2777)'
                          }}
                        />
                        <span className="text-slate-300">{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    <span>Feature Coverage</span>
                  </h4>
                  <div className="space-y-4">
                    {selectedTools.map((tool, idx) => {
                      const featureCount = tool.features.length;
                      const maxFeatures = Math.max(...selectedTools.map(t => t.features.length));
                      const percentage = maxFeatures > 0 ? (featureCount / maxFeatures) * 100 : 0;
                      return (
                        <div key={tool.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              {tool.logo_url ? (
                                <img src={tool.logo_url} alt={tool.name} className="w-5 h-5 rounded object-cover" />
                              ) : (
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                              )}
                              <span className="text-slate-300 font-medium">{tool.name}</span>
                            </div>
                            <span className="text-white font-bold">{featureCount} features</span>
                          </div>
                          <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 transition-all duration-700"
                              style={{ width: `${percentage}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  <span>Rating Comparison</span>
                </h3>
                <div className="space-y-4">
                  {selectedTools.map((tool) => {
                    const percentage = (tool.rating / 5) * 100;
                    const isWinner = getWinner('rating') === tool.id;
                    return (
                      <div key={tool.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {tool.logo_url ? (
                              <img src={tool.logo_url} alt={tool.name} className="w-6 h-6 rounded object-cover" />
                            ) : (
                              <Sparkles className="w-6 h-6 text-cyan-400" />
                            )}
                            <span className="text-white font-medium">{tool.name}</span>
                            {isWinner && <Crown className="w-4 h-4 text-yellow-400" />}
                          </div>
                          <span className="text-white font-bold">{tool.rating.toFixed(1)}</span>
                        </div>
                        <div className="relative h-8 bg-slate-700 rounded-lg overflow-hidden">
                          <div
                            className={`h-full rounded-lg transition-all duration-500 ${
                              isWinner
                                ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold drop-shadow-lg">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <PieChart className="w-6 h-6 text-green-400" />
                  <span>Pricing Distribution</span>
                </h3>
                <div className="flex items-center justify-center h-48 mb-4">
                  <div className="relative w-48 h-48">
                    {(() => {
                      const pricingCounts = selectedTools.reduce((acc, tool) => {
                        acc[tool.pricing_type] = (acc[tool.pricing_type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      const total = selectedTools.length;
                      let currentAngle = 0;
                      const colors = {
                        'Free': { from: '#10b981', to: '#059669' },
                        'Freemium': { from: '#3b82f6', to: '#2563eb' },
                        'Paid': { from: '#f59e0b', to: '#d97706' }
                      };

                      return (
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          {Object.entries(pricingCounts).map(([type, count], idx) => {
                            const percentage = (count / total) * 100;
                            const angle = (percentage / 100) * 360;
                            const startAngle = currentAngle;
                            currentAngle += angle;

                            const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                            const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                            const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                            const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                            const largeArc = angle > 180 ? 1 : 0;

                            return (
                              <path
                                key={type}
                                d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                                fill={`url(#gradient-${idx})`}
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                              >
                                <defs>
                                  <linearGradient id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={colors[type as keyof typeof colors]?.from || '#6b7280'} />
                                    <stop offset="100%" stopColor={colors[type as keyof typeof colors]?.to || '#4b5563'} />
                                  </linearGradient>
                                </defs>
                              </path>
                            );
                          })}
                          <circle cx="50" cy="50" r="25" fill="#1e293b" />
                        </svg>
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(
                    selectedTools.reduce((acc, tool) => {
                      acc[tool.pricing_type] = (acc[tool.pricing_type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          type === 'Free' ? 'bg-green-500' :
                          type === 'Freemium' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`} />
                        <span className="text-slate-300">{type}</span>
                      </div>
                      <span className="text-white font-semibold">
                        {count} ({((count / selectedTools.length) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <LineChart className="w-6 h-6 text-purple-400" />
                  <span>Popularity Comparison</span>
                </h3>
                <div className="space-y-4">
                  {selectedTools
                    .sort((a, b) => b.views - a.views)
                    .map((tool) => {
                      const maxViews = Math.max(...selectedTools.map(t => t.views));
                      const percentage = (tool.views / maxViews) * 100;
                      const isWinner = getWinner('views') === tool.id;
                      return (
                        <div key={tool.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {tool.logo_url ? (
                                <img src={tool.logo_url} alt={tool.name} className="w-6 h-6 rounded object-cover" />
                              ) : (
                                <Sparkles className="w-6 h-6 text-cyan-400" />
                              )}
                              <span className="text-white font-medium">{tool.name}</span>
                              {isWinner && <Crown className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <span className="text-white font-bold">{tool.views.toLocaleString()}</span>
                          </div>
                          <div className="relative h-8 bg-slate-700 rounded-lg overflow-hidden">
                            <div
                              className={`h-full rounded-lg transition-all duration-500 ${
                                isWinner
                                  ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500'
                                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-sm font-semibold drop-shadow-lg">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <Target className="w-6 h-6 text-orange-400" />
                  <span>Overall Score Breakdown</span>
                </h3>
                <div className="space-y-4">
                  {selectedTools
                    .map((tool) => {
                      const ratingScore = (tool.rating / 5) * 30;
                      const viewsScore = (Math.min(tool.views / 100, 100) * 0.3);
                      const featuresScore = tool.features.length * 2;
                      const pricingScore = tool.pricing_type === 'Free' ? 10 : tool.pricing_type === 'Freemium' ? 5 : 0;
                      const overallScore = Math.round(ratingScore + viewsScore + featuresScore + pricingScore);

                      return {
                        tool,
                        overallScore,
                        ratingScore,
                        viewsScore,
                        featuresScore,
                        pricingScore
                      };
                    })
                    .sort((a, b) => b.overallScore - a.overallScore)
                    .map(({ tool, overallScore, ratingScore, viewsScore, featuresScore, pricingScore }) => {
                      const maxScore = Math.max(...selectedTools.map(t => {
                        const rs = (t.rating / 5) * 30;
                        const vs = (Math.min(t.views / 100, 100) * 0.3);
                        const fs = t.features.length * 2;
                        const ps = t.pricing_type === 'Free' ? 10 : t.pricing_type === 'Freemium' ? 5 : 0;
                        return Math.round(rs + vs + fs + ps);
                      }));
                      const isWinner = overallScore === maxScore;

                      return (
                        <div key={tool.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {tool.logo_url ? (
                                <img src={tool.logo_url} alt={tool.name} className="w-6 h-6 rounded object-cover" />
                              ) : (
                                <Sparkles className="w-6 h-6 text-cyan-400" />
                              )}
                              <span className="text-white font-medium">{tool.name}</span>
                              {isWinner && <Crown className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <span className="text-white font-bold">{overallScore}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-slate-400 w-16">Rating:</span>
                              <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                  style={{ width: `${(ratingScore / 30) * 100}%` }}
                                />
                              </div>
                              <span className="text-white w-10 text-right">{ratingScore.toFixed(0)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-slate-400 w-16">Views:</span>
                              <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  style={{ width: `${(viewsScore / 30) * 100}%` }}
                                />
                              </div>
                              <span className="text-white w-10 text-right">{viewsScore.toFixed(0)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-slate-400 w-16">Features:</span>
                              <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                  style={{ width: `${Math.min((featuresScore / 30) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-white w-10 text-right">{featuresScore.toFixed(0)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-slate-400 w-16">Pricing:</span>
                              <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                  style={{ width: `${(pricingScore / 10) * 100}%` }}
                                />
                              </div>
                              <span className="text-white w-10 text-right">{pricingScore.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Detailed Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {selectedTools.map((tool) => (
                  <div key={tool.id} className="border border-slate-700 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-3">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        {tool.logo_url ? (
                          <img src={tool.logo_url} alt={tool.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 flex-shrink-0" />
                        )}
                        <div>
                          <h4 className="text-lg sm:text-xl font-bold text-white">{tool.name}</h4>
                          <p className="text-slate-400 text-sm sm:text-base">{tool.pricing_type}</p>
                        </div>
                      </div>
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-xs sm:text-sm w-full sm:w-auto flex-shrink-0"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      </a>
                    </div>

                    <p className="text-slate-300 text-sm sm:text-base mb-3 sm:mb-4">{tool.description}</p>

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
          <div className="text-center py-12 sm:py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg sm:rounded-xl px-4">
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-slate-400 text-base sm:text-lg mb-1 sm:mb-2">Add at least 2 tools to start comparing</p>
            <p className="text-slate-500 text-sm sm:text-base">You can compare up to 5 tools at once</p>
          </div>
        )}
      </div>
    </div>
  );
}
