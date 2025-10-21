import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Calendar, DollarSign, Star, Sparkles, Heart } from 'lucide-react';
import { supabase, AITool } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { addFavorite, removeFavorite, isFavorite } from '../lib/favorites';
import { trackToolInteraction } from '../lib/recommendations';

export default function ToolDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<AITool | null>(null);
  const [relatedTools, setRelatedTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (slug) {
      loadTool();
    }
  }, [slug]);

  useEffect(() => {
    if (user && tool) {
      checkFavoriteStatus();
    }
  }, [user, tool]);

  const checkFavoriteStatus = async () => {
    if (!user || !tool) return;
    const favorited = await isFavorite(user.id, tool.id);
    setIsFavorited(favorited);
  };

  const handleFavoriteToggle = async () => {
    if (!user || !tool) {
      alert('Please log in to favorite tools');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        const result = await removeFavorite(user.id, tool.id);
        if (result.success) {
          setIsFavorited(false);
        } else {
          alert(result.error || 'Failed to remove favorite');
        }
      } else {
        const result = await addFavorite(user.id, tool.id);
        if (result.success) {
          setIsFavorited(true);
          trackToolInteraction(user.id, tool.id, 'favorite');
        } else {
          alert(result.error || 'Failed to add favorite');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('An error occurred');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const loadTool = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('ai_tools')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('status', 'Published')
      .single();

    if (data) {
      setTool(data);

      await supabase
        .from('ai_tools')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id);

      if (user) {
        trackToolInteraction(user.id, data.id, 'view');
      }

      if (data.category_id) {
        const { data: related } = await supabase
          .from('ai_tools')
          .select('*')
          .eq('category_id', data.category_id)
          .eq('status', 'Published')
          .neq('id', data.id)
          .limit(4);

        if (related) setRelatedTools(related);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-2xl text-white mb-4">Tool not found</h1>
          <Link to="/explore" className="text-cyan-400 hover:text-cyan-300">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <div className="flex items-start space-x-6 mb-6">
                {tool.logo_url ? (
                  <img src={tool.logo_url} alt={tool.name} className="w-20 h-20 rounded-xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{tool.name}</h1>
                  <p className="text-lg text-slate-300 mb-4">{tool.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-700/50 text-cyan-400 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {tool.long_description || tool.description}
                </p>
              </div>

              {tool.features.length > 0 && (
                <div className="border-t border-slate-700 pt-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Key Features</h2>
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
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Tool Information</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-sm text-slate-400">Pricing</div>
                    <div className="text-white font-medium">{tool.pricing_type}</div>
                  </div>
                </div>

                {tool.rating > 0 && (
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-sm text-slate-400">Rating</div>
                      <div className="text-white font-medium flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        {tool.rating.toFixed(1)} / 5.0
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-sm text-slate-400">Launch Date</div>
                    <div className="text-white font-medium">
                      {new Date(tool.launch_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={`flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-lg transition-all font-medium ${
                    isFavorited
                      ? 'bg-red-500/20 text-red-400 border-2 border-red-500 hover:bg-red-500/30'
                      : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600 hover:bg-slate-700 hover:border-cyan-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  <span>{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
                </button>

                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
                >
                  <span>Visit Tool</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Related Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTools.map((relatedTool) => (
                <Link
                  key={relatedTool.id}
                  to={`/tool/${relatedTool.slug}`}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {relatedTool.logo_url ? (
                      <img
                        src={relatedTool.logo_url}
                        alt={relatedTool.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
                      {relatedTool.name}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2">{relatedTool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
