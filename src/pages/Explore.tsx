import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, Star, TrendingUp, Calendar, X } from 'lucide-react';
import { supabase, AITool, Category } from '../lib/supabase';

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedPricing, setSelectedPricing] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [minViews, setMinViews] = useState(0);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
    loadAvailableTags();
  }, []);

  useEffect(() => {
    loadTools();
  }, [searchQuery, selectedCategory, selectedPricing, selectedTags, minRating, minViews, featuredOnly, sortBy]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const loadAvailableTags = async () => {
    const { data } = await supabase
      .from('ai_tools')
      .select('tags')
      .eq('status', 'Published');

    if (data) {
      const allTags = data.flatMap(tool => tool.tags || []);
      const uniqueTags = Array.from(new Set(allTags)).sort();
      setAvailableTags(uniqueTags);
    }
  };

  const loadTools = async () => {
    setLoading(true);
    let query = supabase
      .from('ai_tools')
      .select('*, category:categories(*)')
      .eq('status', 'Published');

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,long_description.ilike.%${searchQuery}%`);
    }

    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    if (selectedPricing) {
      query = query.eq('pricing_type', selectedPricing);
    }

    if (minRating > 0) {
      query = query.gte('rating', minRating);
    }

    if (minViews > 0) {
      query = query.gte('views', minViews);
    }

    if (featuredOnly) {
      query = query.eq('featured', true);
    }

    switch (sortBy) {
      case 'popular':
        query = query.order('views', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data } = await query;

    let filteredData = data || [];

    if (selectedTags.length > 0) {
      filteredData = filteredData.filter(tool =>
        selectedTags.some(tag => tool.tags?.includes(tag))
      );
    }

    setTools(filteredData);
    setLoading(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTools();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Explore AI Tools</h1>
          <p className="text-slate-400">Discover and filter through our collection of AI tools</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for tools..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pricing</label>
                  <select
                    value={selectedPricing}
                    onChange={(e) => setSelectedPricing(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Pricing</option>
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Paid">Paid</option>
                    <option value="Trial">Trial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>Minimum Rating</span>
                    </div>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white w-12 text-right">{minRating > 0 ? `${minRating}+` : 'All'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span>Minimum Views</span>
                    </div>
                  </label>
                  <select
                    value={minViews}
                    onChange={(e) => setMinViews(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="0">All</option>
                    <option value="100">100+</option>
                    <option value="500">500+</option>
                    <option value="1000">1,000+</option>
                    <option value="5000">5,000+</option>
                    <option value="10000">10,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Tags</label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableTags.slice(0, 20).map(tag => (
                      <label key={tag} className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                        />
                        <span className="text-slate-300 text-sm group-hover:text-cyan-400 transition-colors">{tag}</span>
                      </label>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className="flex items-center space-x-1 px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full hover:bg-cyan-500/30 transition-colors"
                        >
                          <span>{tag}</span>
                          <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-slate-300 text-sm flex items-center space-x-1">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>Featured Only</span>
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Sort By</span>
                    </div>
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedPricing('');
                    setSelectedTags([]);
                    setMinRating(0);
                    setMinViews(0);
                    setFeaturedOnly(false);
                    setSortBy('newest');
                  }}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                <p className="text-slate-400 mt-4">Loading tools...</p>
              </div>
            ) : tools.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No tools found matching your criteria</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-slate-400">
                  Showing {tools.length} tool{tools.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={`/tool/${tool.slug}`}
                      className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        {tool.logo_url ? (
                          <img src={tool.logo_url} alt={tool.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {tool.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-slate-400">{tool.pricing_type}</span>
                            {tool.rating > 0 && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-yellow-400">★ {tool.rating.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-300 mb-4 line-clamp-2">{tool.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {tool.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-700/50 text-cyan-400 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
