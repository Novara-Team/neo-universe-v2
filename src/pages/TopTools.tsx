import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { supabase, AITool } from '../lib/supabase';

export default function TopTools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopTools();
  }, []);

  const loadTopTools = async () => {
    const { data } = await supabase
      .from('ai_tools')
      .select('*, category:categories(*)')
      .eq('status', 'Published')
      .order('views', { ascending: false })
      .limit(50);

    if (data) setTools(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Trending This Week</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Top AI Tools</h1>
          <p className="text-slate-400 text-lg">Most popular and highly-rated AI tools in our collection</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="text-slate-400 mt-4">Loading tools...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tools.map((tool, index) => (
              <Link
                key={tool.id}
                to={`/tool/${tool.slug}`}
                className="group block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900'
                          : index === 1
                          ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-slate-900'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {index < 3 ? <Trophy className="w-6 h-6" /> : index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        {tool.logo_url ? (
                          <img src={tool.logo_url} alt={tool.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-slate-400">{tool.category?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        {tool.rating > 0 && (
                          <div className="flex items-center space-x-1 text-yellow-400">
                            <span>★</span>
                            <span className="font-medium">{tool.rating.toFixed(1)}</span>
                          </div>
                        )}
                        <span className="text-slate-500">{tool.views.toLocaleString()} views</span>
                      </div>
                    </div>

                    <p className="text-slate-300 mb-4">{tool.description}</p>

                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm rounded-full">
                        {tool.pricing_type}
                      </span>
                      {tool.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-700/50 text-slate-400 text-sm rounded-full"
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
    </div>
  );
}
