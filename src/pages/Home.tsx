import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Pen, Image, Video, Brain, Code, Mic } from 'lucide-react';
import { supabase, AITool, AINews, Category } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredTools, setFeaturedTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<AINews[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [toolsRes, categoriesRes, newsRes] = await Promise.all([
      supabase
        .from('ai_tools')
        .select('*, category:categories(*)')
        .eq('featured', true)
        .eq('status', 'Published')
        .limit(6),
      supabase.from('categories').select('*').limit(6),
      supabase.from('ai_news').select('*').eq('featured', true).limit(3).order('publication_date', { ascending: false }),
    ]);

    if (toolsRes.data) setFeaturedTools(toolsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (newsRes.data) setNews(newsRes.data);
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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMmQ3ZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptLTEyIDBoMHYuMDFoLS4wMXYtLjAxem0wIDEyYzAgMS4xLS45IDItMiAycy0yLS45LTItMiAuOS0yIDItMiAyIC45IDIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">Discover the Future of AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
              Find the Best AI Tools
              <br />
              for Every Task
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Explore 1000+ AI tools categorized by type, price, and purpose
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for an AI tool..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured AI Tools</h2>
            <p className="text-slate-400">Handpicked tools that are making waves in the AI world</p>
          </div>
          <Link
            to="/explore"
            className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {featuredTools.map((tool) => (
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
                  <span className="text-sm text-slate-400">{tool.pricing_type}</span>
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

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Sparkles;
              return (
                <Link
                  key={category.id}
                  to={`/explore?category=${category.slug}`}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-center"
                >
                  <Icon className="w-8 h-8 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>

        {news.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Latest AI News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <a
                  key={item.id}
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="text-sm text-cyan-400 mb-2">{item.source_name}</div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-3">{item.description}</p>
                  <div className="text-xs text-slate-500">
                    {new Date(item.publication_date).toLocaleDateString()}
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
