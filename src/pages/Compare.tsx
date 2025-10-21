import { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, AITool } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';

export default function Compare() {
  const { profile } = useAuth();
  const [tools, setTools] = useState<AITool[]>([]);
  const [tool1, setTool1] = useState<AITool | null>(null);
  const [tool2, setTool2] = useState<AITool | null>(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [showResults1, setShowResults1] = useState(false);
  const [showResults2, setShowResults2] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    const { data } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('status', 'Published')
      .order('views', { ascending: false })
      .limit(100);

    if (data) setTools(data);
  };

  const filteredTools1 = tools.filter((t) =>
    t.name.toLowerCase().includes(search1.toLowerCase())
  );

  const filteredTools2 = tools.filter((t) =>
    t.name.toLowerCase().includes(search2.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Compare AI Tools</h1>
          <p className="text-slate-400 text-lg mb-6">
            Compare features, pricing, and ratings of two AI tools side by side
          </p>
          {profile && profile.subscription_plan !== 'free' && (
            <Link
              to="/compare/advanced"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/50 font-medium"
            >
              <Crown className="w-5 h-5" />
              <span>Try Advanced Compare</span>
            </Link>
          )}
          {(!profile || profile.subscription_plan === 'free') && (
            <div className="inline-block bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 rounded-xl p-6 max-w-2xl">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Zap className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-white">Unlock Advanced Compare</h3>
              </div>
              <p className="text-slate-300 mb-4">
                Compare up to 5 tools at once with advanced metrics, feature matrix, and detailed analysis
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
              >                <span>Upgrade to Plus or Pro</span>
                <Crown className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">Select First Tool</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={search1}
                onChange={(e) => {
                  setSearch1(e.target.value);
                  setShowResults1(true);
                }}
                onFocus={() => setShowResults1(true)}
                placeholder="Search for a tool..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {showResults1 && search1 && filteredTools1.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredTools1.slice(0, 5).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setTool1(tool);
                      setSearch1(tool.name);
                      setShowResults1(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center space-x-3"
                  >
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
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Second Tool</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={search2}
                onChange={(e) => {
                  setSearch2(e.target.value);
                  setShowResults2(true);
                }}
                onFocus={() => setShowResults2(true)}
                placeholder="Search for a tool..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {showResults2 && search2 && filteredTools2.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredTools2.slice(0, 5).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setTool2(tool);
                      setSearch2(tool.name);
                      setShowResults2(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center space-x-3"
                  >
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
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {tool1 && tool2 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[tool1, tool2].map((tool, idx) => (
              <div
                key={tool.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8"
              >
                <div className="flex items-center space-x-4 mb-6">
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{tool.name}</h2>
                    <p className="text-slate-400">{tool.pricing_type}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                    <p className="text-white">{tool.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Pricing</h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm rounded-full">
                        {tool.pricing_type}
                      </span>
                    </div>
                  </div>

                  {tool.rating > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Rating</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 text-2xl">★</span>
                        <span className="text-white text-xl font-semibold">{tool.rating.toFixed(1)}</span>
                        <span className="text-slate-400">/ 5.0</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Views</h3>
                    <p className="text-white text-lg font-semibold">{tool.views.toLocaleString()}</p>
                  </div>

                  {tool.features.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Key Features</h3>
                      <ul className="space-y-2">
                        {tool.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-slate-300">
                            <span className="text-cyan-400 mt-1">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tool.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Tags</h3>
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
                    </div>
                  )}

                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Select two tools to compare</p>
          </div>
        )}
      </div>
    </div>
  );
}
