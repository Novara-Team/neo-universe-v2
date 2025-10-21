import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, ExternalLink, Clock, Tag, TrendingUp, Share2, BookOpen, Crown } from 'lucide-react';
import { supabase, AINews } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [news, setNews] = useState<AINews | null>(null);
  const [relatedNews, setRelatedNews] = useState<AINews[]>([]);
  const [loading, setLoading] = useState(true);

  const isPaidUser = profile && (profile.subscription_plan === 'plus' || profile.subscription_plan === 'pro');

  useEffect(() => {
    if (!isPaidUser) {
      navigate('/news');
      return;
    }
    loadNewsDetail();
  }, [id, isPaidUser]);

  const loadNewsDetail = async () => {
    if (!id) return;

    setLoading(true);

    const { data: newsData, error } = await supabase
      .from('ai_news')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error loading news:', error);
    } else if (newsData) {
      setNews(newsData);

      const { data: related } = await supabase
        .from('ai_news')
        .select('*')
        .eq('source_name', newsData.source_name)
        .neq('id', id)
        .order('publication_date', { ascending: false })
        .limit(3);

      if (related) {
        setRelatedNews(related);
      }
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleShare = async () => {
    if (navigator.share && news) {
      try {
        await navigator.share({
          title: news.title,
          text: news.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  if (!isPaidUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-slate-400">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-white mb-4">Article not found</h1>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>

        <article className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-3xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">{news.source_name}</span>
              </div>

              {news.featured && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm font-medium">Featured</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4" />
                {formatDate(news.publication_date)}
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                {getReadingTime(news.description)}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {news.title}
            </h1>

            <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>

                <a
                  href={news.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors text-cyan-400"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original
                </a>
              </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-xl text-slate-300 leading-relaxed mb-8 font-medium">
                {news.description}
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Key Insights</h3>
                    <p className="text-slate-400 text-base leading-relaxed">
                      This article from {news.source_name} provides comprehensive coverage of recent developments
                      in the AI industry. The insights shared are particularly relevant for professionals and
                      enthusiasts following the latest trends in artificial intelligence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-slate-300 leading-relaxed">
                <p>
                  {news.description}
                </p>

                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
                  <p className="text-slate-300 italic">
                    This article was published on {formatDate(news.publication_date)} by {news.source_name}.
                    For the complete article with all details, images, and additional content, please visit
                    the original source.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-700">
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 font-semibold"
              >
                <ExternalLink className="w-5 h-5" />
                Read Full Article on {news.source_name}
              </a>
            </div>
          </div>
        </article>

        {relatedNews.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Related Articles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      {item.source_name}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.publication_date)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
