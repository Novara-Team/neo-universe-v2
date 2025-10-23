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
import { trackToolView, trackToolClick, trackToolFavorite } from '../lib/ranking-jobs';
import { getToolReviews, ToolReview } from '../lib/reviews';
import ReviewForm from '../components/ReviewForm';

export default function ToolDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<AITool | null>(null);
  const [relatedTools, setRelatedTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [reviews, setReviews] = useState<ToolReview[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
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
      loadReviews();
    }
  }, [user, tool]);

  const loadReviews = async () => {
    if (!tool) return;
    const toolReviews = await getToolReviews(tool.id);
    setReviews(toolReviews);
  };

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
          trackToolFavorite(tool.id);
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

      trackToolView(data.id);

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
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-400 mb-4"></div>
          <p className="text-slate-300 font-medium">Loading tool details...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-12">
            <Info className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Tool not found</h1>
            <p className="text-slate-400 mb-6">The tool you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 md:pt-24 pb-8 md:pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-4 md:mb-6">
          <Link
            to="/explore"
            className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium"
          >
            ← Back to Explore
          </Link>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border border-slate-700 overflow-hidden mb-6 md:mb-8">
          <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="relative flex flex-col gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  {tool.logo_url ? (
                    <img
                      src={tool.logo_url}
                      alt={tool.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-xl md:rounded-2xl object-cover shadow-2xl ring-2 md:ring-4 ring-white/20 bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-xl md:rounded-2xl bg-white shadow-2xl flex items-center justify-center ring-2 md:ring-4 ring-white/20">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-blue-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 drop-shadow-lg leading-tight">
                    {tool.name}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-50 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 flex-1">
                  {tool.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full border border-white/30"
                    >
                      {tag}
                    </span>
                  ))}
                  {tool.tags.length > 3 && (
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full border border-white/30">
                      +{tool.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    className={`p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl transition-all shadow-lg ${
                      isFavorited
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    className="p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all shadow-lg border border-white/30"
                    title="Share tool"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Info className="w-6 h-6 mr-2 text-cyan-400" />
                  About this Tool
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line">
                    {tool.long_description || tool.description}
                  </p>
                </div>
              </div>

              {tool.features.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <CheckCircle2 className="w-6 h-6 mr-2 text-green-400" />
                    Key Features
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tool.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:shadow-md transition-all"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-200 font-medium leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-cyan-400" />
                  Statistics & Engagement
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-6 text-center shadow-md border border-slate-700">
                    <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white">{tool.views?.toLocaleString() || 0}</div>
                    <div className="text-sm text-slate-400 font-medium">Views</div>
                  </div>

                  {tool.rating > 0 && (
                    <div className="bg-slate-800/50 rounded-xl p-6 text-center shadow-md border border-slate-700">
                      <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-current" />
                      <div className="text-3xl font-bold text-white">{tool.rating.toFixed(1)}</div>
                      <div className="text-sm text-slate-400 font-medium">Rating</div>
                    </div>
                  )}

                  <div className="bg-slate-800/50 rounded-xl p-6 text-center shadow-md border border-slate-700">
                    <Heart className="w-8 h-8 text-red-500 mx-auto mb-2 fill-current" />
                    <div className="text-3xl font-bold text-white">
                      {favoritesCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400 font-medium">Favorites</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700 sticky top-24 space-y-6">
                <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-slate-700">
                  Tool Information
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                      <DollarSign className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-400 font-medium mb-1">Pricing Model</div>
                      <div className="text-white font-semibold text-lg">{tool.pricing_type}</div>
                    </div>
                  </div>

                  {tool.rating > 0 && (
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
                        <Star className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-400 font-medium mb-1">User Rating</div>
                        <div className="text-white font-semibold text-lg flex items-center">
                          <span className="text-yellow-500 mr-1.5">★</span>
                          {tool.rating.toFixed(1)} / 5.0
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                      <Calendar className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-400 font-medium mb-1">Launch Date</div>
                      <div className="text-white font-semibold text-lg">
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

        <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700 p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">User Reviews</h2>
              <p className="text-slate-400">
                {reviews.length > 0
                  ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`
                  : 'Be the first to review this tool'}
              </p>
            </div>
            {user && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg font-semibold"
              >
                <Star className="w-5 h-5" />
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                toolId={tool.id}
                toolName={tool.name}
                onSuccess={() => {
                  setShowReviewForm(false);
                  loadReviews();
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-white">
                        {review.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{review.user_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h5 className="text-white font-semibold text-lg mb-2">{review.title}</h5>
                  <p className="text-slate-300 leading-relaxed mb-4">{review.review_text}</p>

                  {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                      {review.pros && review.pros.length > 0 && (
                        <div>
                          <h6 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Pros
                          </h6>
                          <ul className="space-y-1">
                            {review.pros.map((pro, idx) => (
                              <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                                <span className="text-green-400">•</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {review.cons && review.cons.length > 0 && (
                        <div>
                          <h6 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Cons
                          </h6>
                          <ul className="space-y-1">
                            {review.cons.map((con, idx) => (
                              <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                                <span className="text-red-400">•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : !showReviewForm && (
            <div className="text-center py-12 bg-slate-900/50 border border-slate-700 rounded-2xl">
              <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-4">No reviews yet</p>
              {user ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg font-semibold"
                >
                  <Star className="w-5 h-5" />
                  Be the First to Review
                </button>
              ) : (
                <p className="text-slate-500">
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
                    Sign in
                  </Link>
                  {' '}to write a review
                </p>
              )}
            </div>
          )}
        </div>

        {relatedTools.length > 0 && (
          <div className="mt-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Similar Tools You Might Like</h2>
              <p className="text-slate-400">Explore more tools in the same category</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTools.map((relatedTool) => (
                <Link
                  key={relatedTool.id}
                  to={`/tool/${relatedTool.slug}`}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700 p-6 hover:border-cyan-500/50 hover:shadow-xl transition-all hover:-translate-y-1"
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
                      <h3 className="text-white font-bold group-hover:text-cyan-400 transition-colors truncate">
                        {relatedTool.name}
                      </h3>
                      <div className="flex items-center text-xs text-slate-400 mt-1">
                        <span className="px-2 py-0.5 bg-slate-700/50 rounded-full">
                          {relatedTool.pricing_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm line-clamp-3 leading-relaxed">
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
