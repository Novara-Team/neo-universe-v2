import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, Lock, Globe, Trash2, Share2, Crown } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getUserCollections, createCollection, deleteCollection, Collection } from '../lib/collections';

export default function Collections() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (profile && (profile.subscription_plan === 'plus' || profile.subscription_plan === 'pro')) {
      loadCollections();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold text-white">My Collections</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {profile.subscription_plan.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-400 text-lg">
                Create and share curated collections of your favorite AI tools
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>New Collection</span>
            </button>
          </div>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No collections yet</h2>
            <p className="text-slate-400 mb-6">Create your first collection to organize AI tools</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Create Collection</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
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
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="px-3 py-2 bg-slate-700/50 text-red-400 rounded-lg hover:bg-slate-700 transition-all"
                    title="Delete collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
