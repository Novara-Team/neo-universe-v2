import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink,
  Calendar,
  DollarSign,
  Star,
  Sparkles,
  Heart,
  TrendingUp,
  Users,
  CheckCircle2,
  Info,
  Share2
} from 'lucide-react';
import { supabase, AITool } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { addFavorite, removeFavorite, isFavorite } from '../lib/favorites';
import { trackToolInteraction } from '../lib/recommendations';
import { trackEvent } from '../lib/analytics';

export default function ToolDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<AITool | null>(null);
  const [relatedTools, setRelatedTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
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
    if (tool) {
      loadFavoritesCount();
    }
  }, [user, tool]);

  const checkFavoriteStatus = async () => {
    if (!user || !tool) return;
    const favorited = await isFavorite(user.id, tool.id);
    setIsFavorited(favorited);
  };

  const loadFavoritesCount = async () => {
    if (!tool) return;
    const { count } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('tool_id', tool.id);
    setFavoritesCount(count || 0);
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
          setFavoritesCount(prev => Math.max(0, prev - 1));
        } else {
          alert(result.error || 'Failed to remove favorite');
        }
      } else {
        const result = await addFavorite(user.id, tool.id);
        if (result.success) {
          setIsFavorited(true);
          setFavoritesCount(prev => prev + 1);
          trackToolInteraction(user.id, tool.id, 'favorite');
          trackEvent('tool_favorite', {
            tool_id: tool.id,
            tool_name: tool.name
          });
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
        trackEvent('tool_view', {
          tool_id: data.id,
          tool_name: data.name,
          category: data.category?.name || 'Unknown'
        });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading tool details...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <Info className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Tool not found</h1>
            <p className="text-slate-600 mb-6">The tool you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/explore"
            className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            ← Back to Explore
          </Link>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden mb-8">
          <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-8 md:p-12">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                {tool.logo_url ? (
                  <img
                    src={tool.logo_url}
                    alt={tool.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20 bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white shadow-2xl flex items-center justify-center ring-4 ring-white/20">
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {tool.name}
                </h1>
                <p className="text-lg md:text-xl text-blue-50 mb-4 leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.slice(0, 5).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col gap-3 self-end md:self-start">
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={`p-3 rounded-xl transition-all shadow-lg ${
                    isFavorited
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                <button
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all shadow-lg border border-white/30"
                  title="Share tool"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 md:p-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200/50">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <Info className="w-6 h-6 mr-2 text-blue-600" />
                  About this Tool
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">
                    {tool.long_description || tool.description}
                  </p>
                </div>
              </div>

              {tool.features.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200/50">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
                    Key Features
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tool.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-all"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-700 font-medium leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-slate-200/50">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                  Statistics & Engagement
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 text-center shadow-md border border-slate-200/50">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-slate-900">{tool.views?.toLocaleString() || 0}</div>
                    <div className="text-sm text-slate-600 font-medium">Views</div>
                  </div>

                  {tool.rating > 0 && (
                    <div className="bg-white rounded-xl p-6 text-center shadow-md border border-slate-200/50">
                      <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-current" />
                      <div className="text-3xl font-bold text-slate-900">{tool.rating.toFixed(1)}</div>
                      <div className="text-sm text-slate-600 font-medium">Rating</div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-6 text-center shadow-md border border-slate-200/50">
                    <Heart className="w-8 h-8 text-red-500 mx-auto mb-2 fill-current" />
                    <div className="text-3xl font-bold text-slate-900">
                      {favoritesCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">Favorites</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200/50 sticky top-24 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
                  Tool Information
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-500 font-medium mb-1">Pricing Model</div>
                      <div className="text-slate-900 font-semibold text-lg">{tool.pricing_type}</div>
                    </div>
                  </div>

                  {tool.rating > 0 && (
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-500 font-medium mb-1">User Rating</div>
                        <div className="text-slate-900 font-semibold text-lg flex items-center">
                          <span className="text-yellow-500 mr-1.5">★</span>
                          {tool.rating.toFixed(1)} / 5.0
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-500 font-medium mb-1">Launch Date</div>
                      <div className="text-slate-900 font-semibold text-lg">
                        {new Date(tool.launch_date).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg group"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <button
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    className={`flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-xl transition-all font-semibold ${
                      isFavorited
                        ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100'
                        : 'bg-slate-50 text-slate-700 border-2 border-slate-200 hover:bg-slate-100 hover:border-blue-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    <span>{isFavorited ? 'Added to Favorites' : 'Add to Favorites'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedTools.length > 0 && (
          <div className="mt-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Similar Tools You Might Like</h2>
              <p className="text-slate-600">Explore more tools in the same category</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTools.map((relatedTool) => (
                <Link
                  key={relatedTool.id}
                  to={`/tool/${relatedTool.slug}`}
                  className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    {relatedTool.logo_url ? (
                      <img
                        src={relatedTool.logo_url}
                        alt={relatedTool.name}
                        className="w-14 h-14 rounded-xl object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors truncate">
                        {relatedTool.name}
                      </h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full">
                          {relatedTool.pricing_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                    {relatedTool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
