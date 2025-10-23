import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, TrendingUp, Calendar, ExternalLink, Crown, Lock, Filter, Search, X, Star, Clock, SlidersHorizontal } from 'lucide-react';
import { supabase, AINews } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';

export default function News() {
  const { user, profile } = useAuth();
  const [news, setNews] = useState<AINews[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'featured'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const isPaidUser = profile && (profile.subscription_plan === 'plus' || profile.subscription_plan === 'pro');

  useEffect(() => {
    loadNews();
  }, [searchQuery, categoryFilter, sortBy, timeFilter]);

  const loadNews = async () => {
    setLoading(true);
    let query = supabase.from('ai_news').select('*');

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (categoryFilter) {
      query = query.eq('source_name', categoryFilter);
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (timeFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      query = query.gte('publication_date', startDate.toISOString());
    }

    if (sortBy === 'featured') {
      query = query.order('featured', { ascending: false }).order('publication_date', { ascending: false });
    } else {
      query = query.order('publication_date', { ascending: sortBy === 'oldest' });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading news:', error);
    } else {
      setNews(data || []);
    }

    setLoading(false);
  };

  const uniqueSources = Array.from(new Set(news.map(item => item.source_name))).sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (!user || !isPaidUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-2xl">
              <div className="inline-flex p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl mb-6">
                <Lock className="h-20 w-20 text-amber-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                AI News Hub
              </h1>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Access exclusive, curated AI news and insights with detailed analysis. Stay ahead with the latest developments in artificial intelligence.
              </p>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="h-8 w-8 text-amber-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Premium Feature</h3>
                </div>
                <ul className="text-left text-slate-300 space-y-3 mb-8">
                  <li className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Daily curated AI news from top sources</span>
                  </li>
                  <li className="flex items-start">
                    <Newspaper className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Detailed analysis and expert commentary</span>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Advanced filtering and search capabilities</span>
                  </li>
                </ul>
                <Link
                  to="/pricing"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
                >
                  <Crown className="w-5 h-5" />
                  <span>Upgrade to Access</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
              <Newspaper className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI News Hub</h1>
              <p className="text-slate-400 mt-1">Stay informed with the latest AI developments</p>
            </div>
          </div>

          {profile?.subscription_plan === 'pro' && (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Pro Member Exclusive</span>
            </div>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news articles..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:border-cyan-500/50 transition-all"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
                    <p className="text-sm text-slate-400">Refine your news feed</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-xl transition-all group"
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                      <Newspaper className="w-4 h-4 text-cyan-400" />
                    </div>
                    <label className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                      News Source
                    </label>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    <button
                      onClick={() => setCategoryFilter('')}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${
                        categoryFilter === ''
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500'
                      }`}
                    >
                      <span>All Sources</span>
                      {categoryFilter === '' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </button>
                    {uniqueSources.map(source => (
                      <button
                        key={source}
                        onClick={() => setCategoryFilter(source)}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${
                          categoryFilter === source
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500'
                        }`}
                      >
                        <span className="truncate">{source}</span>
                        {categoryFilter === source && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-green-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-green-400" />
                    </div>
                    <label className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                      Time Period
                    </label>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Time', desc: 'View all articles' },
                      { value: 'today', label: 'Today', desc: 'Last 24 hours' },
                      { value: 'week', label: 'This Week', desc: 'Last 7 days' },
                      { value: 'month', label: 'This Month', desc: 'Last 30 days' }
                    ].map(({ value, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => setTimeFilter(value as typeof timeFilter)}
                        className={`w-full px-4 py-3 rounded-xl text-left transition-all group ${
                          timeFilter === value
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                            : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm">{label}</div>
                            <div className={`text-xs mt-0.5 ${timeFilter === value ? 'text-white/80' : 'text-slate-500'}`}>
                              {desc}
                            </div>
                          </div>
                          {timeFilter === value && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                    </div>
                    <label className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                      Sort Order
                    </label>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'newest', label: 'Newest First', icon: Clock, desc: 'Most recent articles' },
                      { value: 'oldest', label: 'Oldest First', icon: Calendar, desc: 'Historical articles' },
                      { value: 'featured', label: 'Featured', icon: Star, desc: 'Editor picks first' }
                    ].map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        onClick={() => setSortBy(value as typeof sortBy)}
                        className={`w-full px-4 py-3 rounded-xl text-left transition-all group ${
                          sortBy === value
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-sm">{label}</div>
                              <div className={`text-xs mt-0.5 ${sortBy === value ? 'text-white/80' : 'text-slate-500'}`}>
                                {desc}
                              </div>
                            </div>
                          </div>
                          {sortBy === value && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(searchQuery || categoryFilter !== '' || timeFilter !== 'all' || sortBy !== 'newest') && (
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                      <span className="font-semibold text-white">{news.length}</span> articles match your criteria
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('');
                        setTimeFilter('all');
                        setSortBy('newest');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 text-red-400 rounded-xl hover:from-red-500/20 hover:to-orange-500/20 hover:border-red-500/50 transition-all font-semibold text-sm group"
                    >
                      <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
              <p className="text-slate-400">Loading latest news...</p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No news articles found</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-slate-400">
                Showing {news.length} article{news.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                        {item.source_name}
                      </div>
                      {item.featured && (
                        <div className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                          Featured
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.publication_date)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
