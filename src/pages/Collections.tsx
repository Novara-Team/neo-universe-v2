import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, Lock, Globe, Trash2, Share2, Crown, TrendingUp, Star, Search, Grid, BarChart3 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getUserCollections, createCollection, deleteCollection, Collection } from '../lib/collections';
import { trackEvent } from '../lib/analytics';
import { supabase } from '../lib/supabase';

export default function Collections() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-collections' | 'trending' | 'featured' | 'categories' | 'leaderboard'>('my-collections');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [trendingCollections, setTrendingCollections] = useState<Collection[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);
  const [leaderboardCollections, setLeaderboardCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (profile && (profile.subscription_plan === 'plus' || profile.subscription_plan === 'pro')) {
      loadCollections();
      loadTrendingCollections();
      loadFeaturedCollections();
      loadLeaderboard();
    } else if (profile && profile.subscription_plan === 'free') {
      navigate('/pricing');
    }
  }, [user, profile]);

  const loadCollections = async () => {
    if (!user) return;
    try {
      const data = await getUserCollections(user.id);
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_collections')
        .select(`
          *,
          user:user_profiles!user_id(full_name, email)
        `)
        .eq('is_public', true)
        .order('view_count', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error loading trending collections:', error);
        setTrendingCollections([]);
      } else {
        setTrendingCollections(data || []);
      }
    } catch (error) {
      console.error('Error loading trending collections:', error);
      setTrendingCollections([]);
    }
  };

  const loadFeaturedCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_collections')
        .select(`
          *,
          user:user_profiles!user_id(full_name, email)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error loading featured collections:', error);
        setFeaturedCollections([]);
      } else {
        setFeaturedCollections(data || []);
      }
    } catch (error) {
      console.error('Error loading featured collections:', error);
      setFeaturedCollections([]);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('tool_collections')
        .select(`
          *,
          user:user_profiles!user_id(full_name, email)
        `)
        .eq('is_public', true)
        .order('view_count', { ascending: false })
        .limit(50);

      if (data) {
        const rankedCollections = data.map((collection, index) => {
          const viewScore = collection.view_count * 10;
          const toolScore = (collection.tool_count || 0) * 5;
          const ageInDays = Math.floor((Date.now() - new Date(collection.created_at).getTime()) / (1000 * 60 * 60 * 24));
          const freshnessPenalty = Math.max(0, ageInDays * 0.1);
          const totalScore = viewScore + toolScore - freshnessPenalty;

          return {
            ...collection,
            rank: index + 1,
            score: Math.round(totalScore),
            user_name: collection.user?.full_name || collection.user?.email?.split('@')[0] || 'Anonymous'
          };
        }).sort((a, b) => b.score - a.score).map((c, index) => ({ ...c, rank: index + 1 }));

        setLeaderboardCollections(rankedCollections);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCollectionName.trim()) return;

    setCreating(true);
    try {
      const result = await createCollection(
        user.id,
        newCollectionName,
        newCollectionDescription,
        newCollectionPublic
      );

      if (result.success && result.data) {
        setCollections([result.data, ...collections]);
        setShowCreateModal(false);
        setNewCollectionName('');
        setNewCollectionDescription('');
        setNewCollectionPublic(false);

        trackEvent('collection_create', {
          collection_id: result.data.id,
          collection_name: result.data.name,
          is_public: result.data.is_public
        });
      } else {
        alert(result.error || 'Failed to create collection');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    const result = await deleteCollection(collectionId);
    if (result.success) {
      setCollections(collections.filter((c) => c.id !== collectionId));
    } else {
      alert(result.error || 'Failed to delete collection');
    }
  };

  if (!user || !profile || profile.subscription_plan === 'free') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCollectionCard = (collection: Collection) => (
    <div
      key={collection.id}
      className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
              {collection.name}
            </h3>
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              {collection.is_public ? (
                <>
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </>
              )}
              {(collection as any).view_count > 0 && (
                <>
                  <span className="mx-1">•</span>
                  <span>{(collection as any).view_count} views</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4 line-clamp-2">
        {collection.description || 'No description'}
      </p>

      <div className="flex items-center space-x-2">
        <Link
          to={`/collections/${collection.slug}`}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 text-white text-sm rounded-lg hover:bg-slate-700 transition-all"
        >
          <span>View</span>
        </Link>
        {collection.is_public && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/collections/${collection.slug}`);
              alert('Collection link copied!');
            }}
            className="px-3 py-2 bg-slate-700/50 text-cyan-400 rounded-lg hover:bg-slate-700 transition-all"
            title="Copy share link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
        {collection.user_id === user?.id && (
          <button
            onClick={() => handleDeleteCollection(collection.id)}
            className="px-3 py-2 bg-slate-700/50 text-red-400 rounded-lg hover:bg-slate-700 transition-all"
            title="Delete collection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Collections</h1>
                <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {profile.subscription_plan.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-400 text-sm sm:text-base md:text-lg">
                Discover, create, and share curated collections of AI tools
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="whitespace-nowrap">New Collection</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('my-collections')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === 'my-collections'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Folder className="w-4 h-4" />
                My Collections
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === 'trending'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === 'featured'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Star className="w-4 h-4" />
                Featured
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === 'categories'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Grid className="w-4 h-4" />
                Categories
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Leaderboard
              </button>
            </div>

            {activeTab === 'my-collections' && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {activeTab === 'my-collections' && (
          filteredCollections.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
              <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No collections found' : 'No collections yet'}
              </h2>
              <p className="text-slate-400 mb-6">
                {searchQuery ? 'Try a different search term' : 'Create your first collection to organize AI tools'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Collection</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map(renderCollectionCard)}
            </div>
          )
        )}

        {activeTab === 'trending' && (
          trendingCollections.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
              <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No trending collections</h2>
              <p className="text-slate-400">Check back soon for popular collections</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCollections.map(renderCollectionCard)}
            </div>
          )
        )}

        {activeTab === 'featured' && (
          featuredCollections.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
              <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No featured collections</h2>
              <p className="text-slate-400">Check back soon for curated collections</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCollections.map(renderCollectionCard)}
            </div>
          )
        )}

        {activeTab === 'categories' && (
          <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <Grid className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Browse by Category</h2>
            <p className="text-slate-400 mb-8">Explore collections organized by industry and use case</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {['Content Creation', 'Development', 'Marketing', 'Design', 'Productivity', 'Data & Analytics', 'Customer Support', 'Sales'].map((category) => (
                <button
                  key={category}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 hover:bg-slate-800 transition-all"
                >
                  <h3 className="text-white font-semibold text-sm">{category}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          leaderboardCollections.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
              <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No collections yet</h2>
              <p className="text-slate-400">Be the first to create a public collection!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardCollections.map((collection, index) => {
                const getRankColor = () => {
                  if (index === 0) return 'from-yellow-400 to-yellow-600';
                  if (index === 1) return 'from-slate-300 to-slate-500';
                  if (index === 2) return 'from-orange-400 to-orange-600';
                  return 'from-slate-700 to-slate-800';
                };

                return (
                  <div
                    key={collection.id}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${getRankColor()} rounded-xl flex items-center justify-center font-bold text-xl text-slate-900 shadow-lg flex-shrink-0`}>
                        {collection.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            to={`/collections/${collection.slug}`}
                            className="text-white font-semibold text-lg hover:text-cyan-400 transition-colors truncate"
                          >
                            {collection.name}
                          </Link>
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full whitespace-nowrap">
                            {collection.score} pts
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2 line-clamp-1">{collection.description || 'No description'}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            {collection.user_name}
                          </span>
                          <span>{collection.view_count} views</span>
                          <span>{collection.tool_count || 0} tools</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Collection</h2>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="My Favorite AI Tools"
                  required
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="A curated list of..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={newCollectionPublic}
                  onChange={(e) => setNewCollectionPublic(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                />
                <label htmlFor="public" className="text-sm text-slate-300 flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Make this collection public (shareable link)</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCollectionName('');
                    setNewCollectionDescription('');
                    setNewCollectionPublic(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newCollectionName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
