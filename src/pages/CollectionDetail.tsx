import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Folder, Globe, Lock, Plus, X, Search, Sparkles, ExternalLink, ArrowLeft, Share2, Eye, FileText, Download, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getCollectionBySlug, addToolToCollection, removeToolFromCollection } from '../lib/collections';
import { supabase, AITool } from '../lib/supabase';
import { trackCollectionView, trackCollectionShare, getCollectionAnalytics, exportCollectionToCSV, exportCollectionToPDF } from '../lib/collection-analytics';

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
  const [analytics, setAnalytics] = useState<{ totalViews: number; totalShares: number; recentViews: any[]; recentShares: any[] }>({ totalViews: 0, totalShares: 0, recentViews: [], recentShares: [] });

  useEffect(() => {
    if (slug) {
      loadCollection();
      loadTools();
    }
  }, [slug]);

  useEffect(() => {
    if (collection && collection.id) {
      trackCollectionView(collection.id, user?.id);
      if (user && user.id === collection.user_id) {
        loadAnalytics();
      }
    }
  }, [collection?.id]);

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

  const loadAnalytics = async () => {
    if (!collection) return;
    const data = await getCollectionAnalytics(collection.id);
    setAnalytics(data as any);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/collections"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8 font-medium transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Collections</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl">
                  <Folder className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{collection.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm mb-4">
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                      {collection.is_public ? (
                        <>
                          <Globe className="w-4 h-4" />
                          <span className="font-medium">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span className="font-medium">Private</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-medium">{collection.collection_tools.length} tools</span>
                    </div>
                  </div>
                  {collection.description && (
                    <p className="text-white/95 text-lg leading-relaxed max-w-3xl">{collection.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isOwner && (
                  <>
                    <div className="flex items-center space-x-4 px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-white" />
                        <span className="text-white font-bold text-lg">{analytics.totalViews}</span>
                      </div>
                      <div className="w-px h-6 bg-white/30"></div>
                      <div className="flex items-center space-x-2">
                        <Share2 className="w-5 h-5 text-white" />
                        <span className="text-white font-bold text-lg">{analytics.totalShares}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => exportCollectionToCSV(collection, collection.collection_tools)}
                        className="flex items-center space-x-2 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all shadow-lg group"
                        title="Export as CSV"
                      >
                        <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">CSV</span>
                      </button>
                      <button
                        onClick={() => exportCollectionToPDF(collection, collection.collection_tools)}
                        className="flex items-center space-x-2 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all shadow-lg group"
                        title="Export as PDF"
                      >
                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">PDF</span>
                      </button>
                    </div>
                  </>
                )}
                {collection.is_public && (
                  <button
                    onClick={async () => {
                      await trackCollectionShare(collection.id, user?.id);
                      navigator.clipboard.writeText(window.location.href);
                      alert('Collection link copied!');
                      if (user && user.id === collection.user_id) {
                        loadAnalytics();
                      }
                    }}
                    className="flex items-center space-x-2 px-5 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg font-medium group"
                  >
                    <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Share</span>
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => setShowAddTool(true)}
                    className="flex items-center space-x-2 px-5 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-xl font-medium group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Add Tool</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {collection.collection_tools.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No tools yet</h2>
              <p className="text-gray-600 mb-8 text-lg">Start building your collection by adding AI tools</p>
              {isOwner && (
                <button
                  onClick={() => setShowAddTool(true)}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-xl shadow-blue-500/30 group"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  <span>Add Your First Tool</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.collection_tools
              .sort((a, b) => a.position - b.position)
              .map((ct) => (
                <div
                  key={ct.id}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4 flex-1">
                        {ct.ai_tools.logo_url ? (
                          <img
                            src={ct.ai_tools.logo_url}
                            alt={ct.ai_tools.name}
                            className="w-14 h-14 rounded-xl object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                            <Sparkles className="w-7 h-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate mb-1">
                            {ct.ai_tools.name}
                          </h3>
                          <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                            {ct.ai_tools.pricing_type}
                          </span>
                        </div>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveTool(ct.tool_id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all p-2 rounded-lg"
                          title="Remove from collection"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {ct.ai_tools.description}
                    </p>

                    {ct.ai_tools.rating > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(ct.ai_tools.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {ct.ai_tools.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
                      <Link
                        to={`/tool/${ct.ai_tools.slug}`}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                      <a
                        href={ct.ai_tools.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg group"
                        title="Visit website"
                      >
                        <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showAddTool && isOwner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Add Tool to Collection</h2>
              <button
                onClick={() => {
                  setShowAddTool(false);
                  setSearch('');
                  setShowResults(false);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search for a tool to add..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {showResults && search && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTools.slice(0, 10).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleAddTool(tool.id)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      {tool.logo_url ? (
                        <img src={tool.logo_url} alt={tool.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="text-left">
                        <div className="text-gray-900 font-semibold">{tool.name}</div>
                        <div className="text-gray-500 text-sm">{tool.pricing_type}</div>
                      </div>
                    </div>
                    <Plus className="w-6 h-6 text-blue-600 group-hover:rotate-90 transition-transform" />
                  </button>
                ))}
                {filteredTools.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No tools found matching your search</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
