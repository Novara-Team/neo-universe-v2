import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase, AINews } from '../../lib/supabase';

export default function ManageNews() {
  const [news, setNews] = useState<AINews[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<AINews | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source_url: '',
    source_name: '',
    publication_date: new Date().toISOString().split('T')[0],
    featured: false,
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    const { data } = await supabase.from('ai_news').select('*').order('publication_date', { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingNews) {
      await supabase.from('ai_news').update(formData).eq('id', editingNews.id);
    } else {
      await supabase.from('ai_news').insert([formData]);
    }

    resetForm();
    loadNews();
  };

  const handleEdit = (item: AINews) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      description: item.description,
      source_url: item.source_url,
      source_name: item.source_name,
      publication_date: item.publication_date.split('T')[0],
      featured: item.featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this news item?')) {
      await supabase.from('ai_news').delete().eq('id', id);
      loadNews();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingNews(null);
    setFormData({
      title: '',
      description: '',
      source_url: '',
      source_name: '',
      publication_date: new Date().toISOString().split('T')[0],
      featured: false,
    });
  };

  if (showForm) {
    return (
      <div>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {editingNews ? 'Edit News' : 'Add News'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Source URL *</label>
              <input
                type="url"
                required
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Source Name</label>
              <input
                type="text"
                value={formData.source_name}
                onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Publication Date</label>
              <input
                type="date"
                value={formData.publication_date}
                onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                />
                <span>Featured on Homepage</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              {editingNews ? 'Update News' : 'Add News'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">AI News Manager</h1>
          <p className="text-slate-400 text-sm md:text-base">Manage news articles and posts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 font-medium text-sm md:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span>Add News</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 md:p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-base md:text-lg font-semibold text-white">{item.title}</h3>
                    {item.featured && (
                      <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20 font-medium">
                        ★ Featured
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 mb-3 text-sm md:text-base">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-500">
                    <span className="text-slate-400 font-medium">{item.source_name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-slate-500">{new Date(item.publication_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 md:flex-none p-2 md:p-2.5 text-cyan-400 hover:bg-cyan-500/20 rounded-xl transition-all border border-transparent hover:border-cyan-500/30"
                    title="Edit news"
                  >
                    <Edit2 className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 md:flex-none p-2 md:p-2.5 text-red-400 hover:bg-red-500/20 rounded-xl transition-all border border-transparent hover:border-red-500/30"
                    title="Delete news"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
