import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Zap, Target, DollarSign, Clock, Award, FileText, Upload, Crown } from 'lucide-react';
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
    }
  }, [user, selectedCategory]);

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

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            {selectedCategory === 'all' ? 'All Benchmarks' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <button
            onClick={() => alert('Benchmark submission feature coming soon!')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
          >
            <Upload className="w-4 h-4" />
            Submit Benchmark
          </button>
        </div>

        {benchmarks.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No benchmarks available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {benchmarks.map((benchmark) => {
              const Icon = getCategoryIcon(benchmark.benchmark_category);
              return (
                <div
                  key={benchmark.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getCategoryColor(benchmark.benchmark_category)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{benchmark.tool_name}</h3>
                        <p className="text-slate-400">{benchmark.benchmark_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(benchmark.score)}`}>
                          {benchmark.score}/100
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4">{benchmark.test_description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(benchmark.test_date).toLocaleDateString()}
                    </div>
                    <div className={`px-3 py-1 rounded-full ${getCategoryColor(benchmark.benchmark_category)}`}>
                      {benchmark.benchmark_category}
                    </div>
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
    </div>
  );
}
