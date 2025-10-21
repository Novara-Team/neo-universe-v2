import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Pen, Image, Video, Brain, Code, Mic, TrendingUp, Users, Zap, Globe } from 'lucide-react';
import { supabase, AITool, AINews, Category } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredTools, setFeaturedTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<AINews[]>([]);
  const [stats, setStats] = useState({ tools: 0, categories: 0, users: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [toolsRes, categoriesRes, newsRes, allToolsRes, allCategoriesRes] = await Promise.all([
      supabase
        .from('ai_tools')
        .select('*, category:categories(*)')
        .eq('featured', true)
        .eq('status', 'Published')
        .limit(6),
      supabase.from('categories').select('*').limit(8),
      supabase.from('ai_news').select('*').eq('featured', true).limit(3).order('publication_date', { ascending: false }),
      supabase.from('ai_tools').select('id', { count: 'exact', head: true }).eq('status', 'Published'),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
    ]);

    if (toolsRes.data) setFeaturedTools(toolsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (newsRes.data) setNews(newsRes.data);

    setStats({
      tools: allToolsRes.count || 0,
      categories: allCategoriesRes.count || 0,
      users: 1250
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categoryIcons: Record<string, any> = {
    Writing: Pen,
    Image,
    Video,
    Study: Brain,
    Coding: Code,
    Audio: Mic,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/0 to-slate-900/0"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMmQ3ZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptLTEyIDBoMHYuMDFoLS4wMXYtLjAxem0wIDEyYzAgMS4xLS45IDItMiAycy0yLS45LTItMiAuOS0yIDItMiAyIC45IDIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6 sm:mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs sm:text-sm font-medium">Discover the Future of AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                Find the Best
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                AI Tools
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                for Every Task
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Explore over <span className="text-cyan-400 font-semibold">{stats.tools}+</span> AI tools, curated and categorized for your needs
            </p>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8 sm:mb-12">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for an AI tool..."
                    className="w-full pl-14 pr-36 py-4 sm:py-5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-xl transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-cyan-500/50 transition-all group">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.tools}+</div>
                <div className="text-sm text-slate-400">AI Tools</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-cyan-500/50 transition-all group">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.categories}+</div>
                <div className="text-sm text-slate-400">Categories</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-cyan-500/50 transition-all group">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.users}+</div>
                <div className="text-sm text-slate-400">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Featured AI Tools</h2>
            <p className="text-slate-400">Handpicked tools that are making waves in the AI world</p>
          </div>
          <Link
            to="/explore"
            className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span className="font-medium">View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 sm:mb-24">
          {featuredTools.map((tool) => (
            <Link
              key={tool.id}
              to={`/tool/${tool.slug}`}
              className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all"></div>
              <div className="relative">
                <div className="flex items-start space-x-4 mb-4">
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-700 group-hover:ring-cyan-500/50 transition-all" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/30">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1 truncate">
                      {tool.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-cyan-400 border border-slate-600">
                      {tool.pricing_type}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 mb-4 line-clamp-2 text-sm leading-relaxed">{tool.description}</p>

                <div className="flex flex-wrap gap-2">
                  {tool.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-700/30 text-cyan-400 text-xs rounded-lg border border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Explore by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Sparkles;
              return (
                <Link
                  key={category.id}
                  to={`/explore?category=${category.slug}`}
                  className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all text-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all"></div>
                  <div className="relative">
                    <div className="inline-flex p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {news.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Latest AI News</h2>
                <p className="text-slate-400">Stay updated with the latest in AI technology</p>
              </div>
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <a
                  key={item.id}
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                        {item.source_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(item.publication_date).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
