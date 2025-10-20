import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getUserFavorites, removeFavorite, checkFavoriteLimit } from '../lib/favorites';

interface FavoriteTool {
  id: string;
  created_at: string;
  tool_id: string;
  tools: {
    id: string;
    name: string;
    description: string;
    website_url: string;
    logo_url: string;
    category: string;
    pricing_type: string;
    rating: number;
    total_reviews: number;
    is_featured: boolean;
  };
}

export default function FavoriteTools() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitInfo, setLimitInfo] = useState<{ currentCount: number; maxCount: number | null }>({
    currentCount: 0,
    maxCount: null,
  });

  useEffect(() => {
    if (user) {
      loadFavorites();
      loadLimitInfo();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const data = await getUserFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLimitInfo = async () => {
    if (!user) return;
    try {
      const limit = await checkFavoriteLimit(user.id);
      setLimitInfo({ currentCount: limit.currentCount, maxCount: limit.maxCount });
    } catch (error) {
      console.error('Error loading limit info:', error);
    }
  };

  const handleRemoveFavorite = async (toolId: string) => {
    if (!user) return;
    const result = await removeFavorite(user.id, toolId);
    if (result.success) {
      setFavorites(favorites.filter((fav) => fav.tool_id !== toolId));
      setLimitInfo((prev) => ({ ...prev, currentCount: prev.currentCount - 1 }));
    } else {
      alert(result.error || 'Failed to remove favorite');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Favorite Tools</h1>
            <p className="text-slate-400 mb-8">Please log in to view your favorite tools</p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              <span>My Favorite Tools</span>
            </h1>
            {limitInfo.maxCount !== null && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
                <span className="text-slate-400">
                  {limitInfo.currentCount} / {limitInfo.maxCount} favorites
                </span>
              </div>
            )}
          </div>
          {limitInfo.maxCount !== null && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-400 text-sm">
                Free plan limited to 3 favorites.{' '}
                <Link to="/pricing" className="underline hover:text-amber-300">
                  Upgrade to Creator or Universe Master
                </Link>{' '}
                for unlimited favorites!
              </p>
            </div>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No favorites yet</h2>
            <p className="text-slate-400 mb-6">Start exploring and add your favorite AI tools</p>
            <Link
              to="/explore"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
            >
              Explore AI Tools
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    {favorite.tools.logo_url ? (
                      <img
                        src={favorite.tools.logo_url}
                        alt={favorite.tools.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors truncate">
                        {favorite.tools.name}
                      </h3>
                      <p className="text-slate-400 text-sm">{favorite.tools.pricing_type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.tool_id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{favorite.tools.description}</p>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-2 py-1 bg-slate-700/50 text-cyan-400 text-xs rounded">
                    {favorite.tools.category}
                  </span>
                  {favorite.tools.rating > 0 && (
                    <span className="text-yellow-400 text-sm flex items-center">
                      ★ {favorite.tools.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <a
                    href={favorite.tools.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
