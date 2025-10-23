import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, Star, TrendingUp, Calendar, X, ChevronDown, ChevronUp, MessageSquare, Send, Mic } from 'lucide-react';
import { supabase, AITool, Category } from '../lib/supabase';
import Checkbox from '../components/Checkbox';
import { performAISearch, SearchMessage } from '../lib/ai-search';

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
  const [showFilters, setShowFilters] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<SearchMessage[]>([]);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiSearching, setAiSearching] = useState(false);

  useEffect(() => {
    loadCategories();
    loadAvailableTags();
  }, []);

  useEffect(() => {
    if (!aiMode || !searchQuery) {
      loadTools();
    }
  }, [searchQuery, selectedCategory, selectedPricing, selectedTags, minRating, minViews, featuredOnly, sortBy, aiMode]);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (aiMode && searchQuery.trim()) {
      setAiSearching(true);

      const userMessage: SearchMessage = { role: 'user', content: searchQuery };
      const updatedHistory = [...conversationHistory, userMessage];
      setConversationHistory(updatedHistory);

      const result = await performAISearch(searchQuery, updatedHistory);

      const assistantMessage: SearchMessage = { role: 'assistant', content: result.response };
      setConversationHistory([...updatedHistory, assistantMessage]);
      setAiResponse(result.response);

      if (result.results && result.results.length > 0) {
        setTools(result.results);
      }

      if (result.suggestedFilters) {
        if (result.suggestedFilters.category) {
          const category = categories.find(c =>
            c.name.toLowerCase().includes(result.suggestedFilters.category.toLowerCase())
          );
          if (category) setSelectedCategory(category.slug);
        }
        if (result.suggestedFilters.pricing) {
          setSelectedPricing(result.suggestedFilters.pricing);
        }
      }

      setAiSearching(false);
      setLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };

      recognition.start();
    } else {
      alert('Voice search is not supported in your browser');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Explore AI Tools</h1>
          <p className="text-slate-400">Discover and filter through our collection of AI tools</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAiMode(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  !aiMode
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Standard Search
              </button>
              <button
                onClick={() => setAiMode(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  aiMode
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                AI Search
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch}>
            <div className="relative">
              {aiMode ? (
                <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              ) : (
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={aiMode ? 'Ask me anything... e.g., "Show me free AI tools for image editing"' : 'Search for tools...'}
                className={`w-full pl-12 pr-32 py-4 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  aiMode
                    ? 'border-cyan-500/50 focus:ring-cyan-500 shadow-lg shadow-cyan-500/20'
                    : 'border-slate-700 focus:ring-cyan-500'
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {aiMode && (
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Voice search"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={aiSearching}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {aiSearching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{aiSearching ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
            </div>
          </form>

          {aiMode && conversationHistory.length > 0 && (
            <div className="mt-4 bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-700/50 border-b border-slate-600">
                <span className="text-sm text-slate-300 font-medium">AI Search Results</span>
                <button
                  onClick={() => {
                    setConversationHistory([]);
                    setAiResponse('');
                  }}
                  className="p-1 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Hide results"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {conversationHistory.slice(-4).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold">Filters</span>
                </div>
                {showFilters ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 lg:sticky lg:top-24`}>
              <div className="hidden lg:flex items-center space-x-2 mb-6">
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
                  <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2">
                    {availableTags.slice(0, 20).map(tag => (
                      <Checkbox
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        label={tag}
                        id={`tag-${tag}`}
                      />
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
                  <Checkbox
                    checked={featuredOnly}
                    onChange={setFeaturedOnly}
                    label={
                      <span className="flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>Featured Only</span>
                      </span>
                    }
                    id="featured-only"
                  />
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
