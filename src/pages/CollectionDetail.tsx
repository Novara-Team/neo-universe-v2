import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Folder, Globe, Lock, Plus, X, Search, Sparkles, ExternalLink, ArrowLeft, Share2 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getCollectionBySlug, addToolToCollection, removeToolFromCollection } from '../lib/collections';
import { supabase, AITool } from '../lib/supabase';

interface CollectionData {
  id: string;
  user_id: string;
  name: string;
  description: string;
  slug: string;
  is_public: boolean;
  created_at: string;
  collection_tools: Array<{
    id: string;
    position: number;
    tool_id: string;
    ai_tools: {
      id: string;
      name: string;
      slug: string;
      description: string;
      logo_url: string;
      website_url: string;
      pricing_type: string;
      rating: number;
    };
  }>;
}

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTool, setShowAddTool] = useState(false);
  const [search, setSearch] = useState('');
  const [tools, setTools] = useState<AITool[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCollection();
      loadTools();
    }
  }, [slug]);

  const loadCollection = async () => {
    try {
      const data = await getCollectionBySlug(slug!);
      if (!data) {
        navigate('/collections');
        return;
      }
      setCollection(data);
    } catch (error) {
      console.error('Error loading collection:', error);
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async () => {
    const { data } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('status', 'Published')
      .order('views', { ascending: false })
      .limit(100);

    if (data) setTools(data);
  };

  const handleAddTool = async (toolId: string) => {
    if (!collection) return;

    const result = await addToolToCollection(collection.id, toolId);
    if (result.success) {
      await loadCollection();
      setSearch('');
      setShowResults(false);
    } else {
      alert(result.error || 'Failed to add tool');
    }
  };

  const handleRemoveTool = async (toolId: string) => {
    if (!collection) return;

    const result = await removeToolFromCollection(collection.id, toolId);
    if (result.success) {
      await loadCollection();
    } else {
      alert(result.error || 'Failed to remove tool');
    }
  };

  const filteredTools = tools.filter(
    (t) =>
      !collection?.collection_tools.find((ct) => ct.tool_id === t.id) &&
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  const isOwner = user && collection && user.id === collection.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/collections"
            className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collections</span>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                  <Folder className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">{collection.name}</h1>
                  <div className="flex items-center space-x-2 text-sm text-slate-400 mt-1">
                    {collection.is_public ? (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>Public Collection</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Private Collection</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{collection.collection_tools.length} tools</span>
                  </div>
                </div>
              </div>
              {collection.description && (
                <p className="text-slate-300 text-lg mt-4">{collection.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {collection.is_public && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Collection link copied!');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 text-cyan-400 rounded-lg hover:bg-slate-700 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => setShowAddTool(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tool</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {collection.collection_tools.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
            <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No tools yet</h2>
            <p className="text-slate-400 mb-6">Add tools to this collection to get started</p>
            {isOwner && (
              <button
                onClick={() => setShowAddTool(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Tool</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.collection_tools
              .sort((a, b) => a.position - b.position)
              .map((ct) => (
                <div
                  key={ct.id}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      {ct.ai_tools.logo_url ? (
                        <img
                          src={ct.ai_tools.logo_url}
                          alt={ct.ai_tools.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors truncate">
                          {ct.ai_tools.name}
                        </h3>
                        <p className="text-slate-400 text-sm">{ct.ai_tools.pricing_type}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveTool(ct.tool_id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remove from collection"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{ct.ai_tools.description}</p>

                  {ct.ai_tools.rating > 0 && (
                    <div className="flex items-center space-x-1 text-yellow-400 text-sm mb-4">
                      <span>★</span>
                      <span>{ct.ai_tools.rating.toFixed(1)}</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      to={`/tool/${ct.ai_tools.slug}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 text-white text-sm rounded-lg hover:bg-slate-700 transition-all"
                    >
                      <span>View Details</span>
                    </Link>
                    <a
                      href={ct.ai_tools.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showAddTool && isOwner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Tool to Collection</h2>
              <button
                onClick={() => {
                  setShowAddTool(false);
                  setSearch('');
                  setShowResults(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
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
                placeholder="Search for a tool to add..."
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {showResults && search && (
              <div className="space-y-2">
                {filteredTools.slice(0, 10).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleAddTool(tool.id)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {tool.logo_url ? (
                        <img src={tool.logo_url} alt={tool.name} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <Sparkles className="w-10 h-10 text-cyan-400" />
                      )}
                      <div className="text-left">
                        <div className="text-white font-medium">{tool.name}</div>
                        <div className="text-slate-400 text-sm">{tool.pricing_type}</div>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-cyan-400" />
                  </button>
                ))}
                {filteredTools.length === 0 && (
                  <div className="text-center py-8 text-slate-400">No tools found</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
