import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Zap, Target, DollarSign, Clock, Award, FileText, Upload, Crown, Filter, Search, Download, ExternalLink, ChevronDown, Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';

interface Benchmark {
  id: string;
  tool_id: string;
  tool_name: string;
  benchmark_name: string;
  benchmark_category: string;
  score: number;
  test_description: string;
  test_date: string;
  metrics: any;
}

export default function Benchmarks() {
  const { user, profile } = useAuth();
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, categories: {} as Record<string, number> });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tools, setTools] = useState<any[]>([]);
  const [submitForm, setSubmitForm] = useState({
    tool_id: '',
    benchmark_name: '',
    score: '',
    category: 'speed',
    test_description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { id: 'all', name: 'All Tests', icon: BarChart3 },
    { id: 'speed', name: 'Speed', icon: Zap },
    { id: 'accuracy', name: 'Accuracy', icon: Target },
    { id: 'cost', name: 'Cost Efficiency', icon: DollarSign },
    { id: 'quality', name: 'Quality', icon: Award },
    { id: 'reliability', name: 'Reliability', icon: TrendingUp },
  ];

  useEffect(() => {
    if (user) {
      loadBenchmarks();
      loadTools();
    }
  }, [user, selectedCategory]);

  const loadTools = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('id, name, slug')
        .eq('status', 'Published')
        .order('name');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error loading tools:', error);
    }
  };

  const loadBenchmarks = async () => {
    try {
      let query = supabase
        .from('tool_benchmarks')
        .select(`
          *,
          ai_tools!inner(name)
        `)
        .order('test_date', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('benchmark_category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map((item: any) => ({
        ...item,
        tool_name: item.ai_tools?.name || 'Unknown Tool'
      })) || [];

      setBenchmarks(formattedData);
      calculateStats(formattedData);
    } catch (error) {
      console.error('Error loading benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : BarChart3;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'speed':
        return 'text-cyan-400 bg-cyan-500/10';
      case 'accuracy':
        return 'text-green-400 bg-green-500/10';
      case 'cost':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'quality':
        return 'text-blue-400 bg-blue-500/10';
      case 'reliability':
        return 'text-orange-400 bg-orange-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const calculateStats = (data: Benchmark[]) => {
    const total = data.length;
    const avgScore = total > 0 ? data.reduce((sum, b) => sum + b.score, 0) / total : 0;
    const categories = data.reduce((acc, b) => {
      acc[b.benchmark_category] = (acc[b.benchmark_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    setStats({ total, avgScore, categories });
  };

  const getFilteredAndSortedBenchmarks = () => {
    let filtered = benchmarks;

    if (searchQuery) {
      filtered = filtered.filter(
        b => b.tool_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             b.benchmark_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const compareValue = sortBy === 'score'
        ? a.score - b.score
        : new Date(a.test_date).getTime() - new Date(b.test_date).getTime();
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  };

  const handleExport = () => {
    const csv = [
      ['Tool Name', 'Benchmark', 'Category', 'Score', 'Date'],
      ...filteredBenchmarks.map(b => [
        b.tool_name,
        b.benchmark_name,
        b.benchmark_category,
        b.score.toString(),
        new Date(b.test_date).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmarks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_submitted_benchmarks')
        .insert({
          user_id: profile.id,
          tool_id: submitForm.tool_id,
          benchmark_name: submitForm.benchmark_name,
          score: parseFloat(submitForm.score),
          test_description: submitForm.test_description,
          test_results: {
            category: submitForm.category,
            submitted_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      alert('Benchmark submitted successfully! It will be reviewed by our team.');
      setShowSubmitModal(false);
      setSubmitForm({
        tool_id: '',
        benchmark_name: '',
        score: '',
        category: 'speed',
        test_description: ''
      });
    } catch (error) {
      console.error('Error submitting benchmark:', error);
      alert('Failed to submit benchmark. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBenchmarks = getFilteredAndSortedBenchmarks();

  if (!user || !profile || (profile.subscription_plan !== 'plus' && profile.subscription_plan !== 'pro')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Crown className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Premium Feature</h1>
          <p className="text-xl text-slate-300 mb-8">
            AI Tool Benchmarks are available for Plus and Pro subscribers.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-semibold"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="mt-6 text-lg text-cyan-400 font-medium">Loading benchmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-sm font-semibold mb-6">
            <BarChart3 className="w-4 h-4" />
            Performance Testing
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-6">
            AI Tool Benchmarks
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Comprehensive performance testing and comparisons across similar AI tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-300 font-semibold">Total Benchmarks</h3>
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.total}</p>
            <p className="text-sm text-slate-400">Across all categories</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-300 font-semibold">Average Score</h3>
              <Star className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.avgScore.toFixed(1)}</p>
            <p className="text-sm text-slate-400">Out of 100 points</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-300 font-semibold">Categories</h3>
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{Object.keys(stats.categories).length}</p>
            <p className="text-sm text-slate-400">Different test types</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search benchmarks by tool or test name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:border-slate-600 transition-all"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {profile?.subscription_plan === 'pro' && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:border-slate-600 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}

              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
              >
                <Upload className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Sort By</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('score')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all ${sortBy === 'score' ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-slate-700/50 border border-slate-600 text-slate-300'}`}
                    >
                      Score
                    </button>
                    <button
                      onClick={() => setSortBy('date')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all ${sortBy === 'date' ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-slate-700/50 border border-slate-600 text-slate-300'}`}
                    >
                      Date
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Order</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortOrder('desc')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all ${sortOrder === 'desc' ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-slate-700/50 border border-slate-600 text-slate-300'}`}
                    >
                      Descending
                    </button>
                    <button
                      onClick={() => setSortOrder('asc')}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all ${sortOrder === 'asc' ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-slate-700/50 border border-slate-600 text-slate-300'}`}
                    >
                      Ascending
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {selectedCategory === 'all' ? 'All Benchmarks' : categories.find(c => c.id === selectedCategory)?.name}
              <span className="ml-3 text-lg text-slate-400 font-normal">({filteredBenchmarks.length})</span>
            </h2>
          </div>
        </div>

        {filteredBenchmarks.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {searchQuery ? 'No benchmarks match your search.' : 'No benchmarks available yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBenchmarks.map((benchmark) => {
              const Icon = getCategoryIcon(benchmark.benchmark_category);
              return (
                <div
                  key={benchmark.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${getCategoryColor(benchmark.benchmark_category)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {benchmark.tool_name}
                          {benchmark.score >= 80 && (
                            <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold rounded-full">TOP PERFORMER</span>
                          )}
                        </h3>
                        <p className="text-slate-400">{benchmark.benchmark_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(benchmark.score)}`}>
                          {benchmark.score}/100
                        </p>
                      </div>
                      <div className="w-20 h-20">
                        <svg className="transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-700" />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${benchmark.score}, 100`}
                            className={getScoreColor(benchmark.score)}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4">{benchmark.test_description}</p>

                  {benchmark.metrics && Object.keys(benchmark.metrics).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                      {Object.entries(benchmark.metrics).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-xs text-slate-500 uppercase mb-1">{key}</p>
                          <p className="text-sm font-bold text-white">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(benchmark.test_date).toLocaleDateString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full ${getCategoryColor(benchmark.benchmark_category)}`}>
                        {benchmark.benchmark_category}
                      </div>
                    </div>
                    <Link
                      to={`/tool/${benchmark.tool_id}`}
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
                    >
                      View Tool
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {profile?.subscription_plan === 'pro' && (
          <div className="mt-12 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro Feature: Detailed Reports</h3>
                <p className="text-slate-300 mb-4">
                  Generate comprehensive PDF reports with historical data, performance trends, and side-by-side comparisons.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg font-semibold">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Submit Benchmark</h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitBenchmark} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  AI Tool
                </label>
                <select
                  required
                  value={submitForm.tool_id}
                  onChange={(e) => setSubmitForm({ ...submitForm, tool_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select a tool...</option>
                  {tools.map((tool) => (
                    <option key={tool.id} value={tool.id}>{tool.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Benchmark Name
                </label>
                <input
                  type="text"
                  required
                  value={submitForm.benchmark_name}
                  onChange={(e) => setSubmitForm({ ...submitForm, benchmark_name: e.target.value })}
                  placeholder="e.g., GPT-4 Response Time Test"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Category
                </label>
                <select
                  required
                  value={submitForm.category}
                  onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="speed">Speed</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="cost">Cost Efficiency</option>
                  <option value="quality">Quality</option>
                  <option value="reliability">Reliability</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  value={submitForm.score}
                  onChange={(e) => setSubmitForm({ ...submitForm, score: e.target.value })}
                  placeholder="85.5"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Test Description
                </label>
                <textarea
                  required
                  value={submitForm.test_description}
                  onChange={(e) => setSubmitForm({ ...submitForm, test_description: e.target.value })}
                  placeholder="Describe the test methodology, conditions, and results..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Benchmark'}
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <p className="text-sm text-cyan-400">
                Your benchmark submission will be reviewed by our team before being published. This helps ensure quality and accuracy of all benchmark data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
