import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, BarChart3, Star, Eye, Calendar, Tag } from 'lucide-react';
import { supabase, AITool, Category } from '../../lib/supabase';

export default function ManageTools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [filteredTools, setFilteredTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    logo_url: '',
    website_url: '',
    category_id: '',
    pricing_type: 'Free',
    rating: 0,
    launch_date: new Date().toISOString().split('T')[0],
    featured: false,
    status: 'Published',
    tags: '',
    features: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTools();
  }, [searchQuery, filterStatus, filterCategory, tools]);

  const loadData = async () => {
    const [toolsRes, categoriesRes] = await Promise.all([
      supabase.from('ai_tools').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ]);

    if (toolsRes.data) {
      setTools(toolsRes.data);
      const published = toolsRes.data.filter(t => t.status === 'Published').length;
      const draft = toolsRes.data.filter(t => t.status === 'Draft').length;
      const totalViews = toolsRes.data.reduce((sum, t) => sum + t.views, 0);
      setStats({
        total: toolsRes.data.length,
        published,
        draft,
        totalViews
      });
    }
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const filterTools = () => {
    let result = tools;

    if (searchQuery) {
      result = result.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(tool => tool.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      result = result.filter(tool => tool.category_id === filterCategory);
    }

    setFilteredTools(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const toolData = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      features: formData.features.split('\n').map((f) => f.trim()).filter(Boolean),
      rating: Number(formData.rating),
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };

    if (editingTool) {
      await supabase.from('ai_tools').update(toolData).eq('id', editingTool.id);
    } else {
      await supabase.from('ai_tools').insert([toolData]);
    }

    resetForm();
    loadData();
  };

  const handleEdit = (tool: AITool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      long_description: tool.long_description,
      logo_url: tool.logo_url,
      website_url: tool.website_url,
      category_id: tool.category_id || '',
      pricing_type: tool.pricing_type,
      rating: tool.rating,
      launch_date: tool.launch_date,
      featured: tool.featured,
      status: tool.status,
      tags: tool.tags.join(', '),
      features: tool.features.join('\n'),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      await supabase.from('ai_tools').delete().eq('id', id);
      loadData();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTool(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      long_description: '',
      logo_url: '',
      website_url: '',
      category_id: '',
      pricing_type: 'Free',
      rating: 0,
      launch_date: new Date().toISOString().split('T')[0],
      featured: false,
      status: 'Published',
      tags: '',
      features: '',
    });
  };

  if (showForm) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {editingTool ? 'Edit AI Tool' : 'Add New AI Tool'}
          </h1>
          <p className="text-slate-400">
            {editingTool ? 'Update the details of this AI tool' : 'Fill in the details to add a new AI tool to the platform'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Tool Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="e.g., ChatGPT"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Auto-generated from name if empty"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Short Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Brief description of the tool..."
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Detailed Description</label>
              <textarea
                value={formData.long_description}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Comprehensive description with features and benefits..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Website URL *</label>
              <input
                type="url"
                required
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Logo URL</label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Pricing Model *</label>
              <select
                required
                value={formData.pricing_type}
                onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              >
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
                <option value="Trial">Trial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Rating (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="4.5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Launch Date</label>
              <input
                type="date"
                value={formData.launch_date}
                onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Publication Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Demo">Demo (Pro Users Only)</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-3 text-slate-300 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 cursor-pointer"
                />
                <div>
                  <span className="font-medium group-hover:text-white transition-colors">Featured Tool</span>
                  <p className="text-xs text-slate-500">Display prominently on homepage</p>
                </div>
              </label>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="AI, Writing, Productivity, Automation"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Key Features (one per line)</label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono text-sm"
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-slate-700">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 font-semibold"
            >
              {editingTool ? 'Update Tool' : 'Create Tool'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all font-semibold"
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          AI Tools Management
        </h1>
        <p className="text-slate-400">
          Manage your AI tools database with powerful filtering and search capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Tools</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Published</p>
          <p className="text-3xl font-bold text-white">{stats.published}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Edit2 className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Drafts</p>
          <p className="text-3xl font-bold text-white">{stats.draft}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Views</p>
          <p className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          >
            <option value="all">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 font-semibold whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Tool</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/20 border-t-cyan-500"></div>
          <p className="text-slate-400 mt-6">Loading tools...</p>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No tools found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterCategory('all');
            }}
            className="px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  {tool.logo_url ? (
                    <img
                      src={tool.logo_url}
                      alt={tool.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-slate-600 group-hover:border-cyan-500/50 transition-colors"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border-2 border-slate-600">
                      <span className="text-white text-2xl font-bold">{tool.name[0]}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {tool.name}
                        </h3>
                        {tool.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-lg">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{tool.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Tag className="w-4 h-4" />
                          {tool.category?.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Eye className="w-4 h-4" />
                          {tool.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(tool.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs rounded-lg font-semibold border ${
                            tool.status === 'Published'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : tool.status === 'Draft'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {tool.status}
                        </span>
                        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-lg font-semibold">
                          {tool.pricing_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(tool)}
                        className="p-3 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all border border-cyan-500/20 hover:border-cyan-500/40 hover:scale-110"
                        title="Edit tool"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tool.id)}
                        className="p-3 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20 hover:border-red-500/40 hover:scale-110"
                        title="Delete tool"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
