import { useState, useEffect } from 'react';
import { BarChart3, Edit2, Trash2, Save, X, Plus, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Benchmark {
  id: string;
  tool_id: string;
  benchmark_name: string;
  benchmark_category: string;
  score: number;
  test_description: string;
  test_date: string;
  metrics: any;
  tool_name?: string;
}

interface SubmittedBenchmark {
  id: string;
  user_id: string;
  tool_id: string;
  benchmark_name: string;
  score: number;
  test_description: string;
  test_results: any;
  status: string;
  created_at: string;
  tool_name?: string;
}

export default function ManageBenchmarks() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [submittedBenchmarks, setSubmittedBenchmarks] = useState<SubmittedBenchmark[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Benchmark>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBenchmark, setNewBenchmark] = useState({
    tool_id: '',
    benchmark_name: '',
    benchmark_category: 'speed',
    score: '',
    test_description: '',
    metrics: '{}'
  });
  const [activeTab, setActiveTab] = useState<'published' | 'submitted'>('published');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadBenchmarks(),
      loadSubmittedBenchmarks(),
      loadTools()
    ]);
    setLoading(false);
  };

  const loadBenchmarks = async () => {
    const { data, error } = await supabase
      .from('tool_benchmarks')
      .select(`
        *,
        ai_tools!inner(name)
      `)
      .order('test_date', { ascending: false });

    if (!error && data) {
      setBenchmarks(data.map((item: any) => ({
        ...item,
        tool_name: item.ai_tools?.name || 'Unknown'
      })));
    }
  };

  const loadSubmittedBenchmarks = async () => {
    const { data, error } = await supabase
      .from('user_submitted_benchmarks')
      .select(`
        *,
        ai_tools!inner(name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmittedBenchmarks(data.map((item: any) => ({
        ...item,
        tool_name: item.ai_tools?.name || 'Unknown'
      })));
    }
  };

  const loadTools = async () => {
    const { data } = await supabase
      .from('ai_tools')
      .select('id, name')
      .eq('status', 'Published')
      .order('name');

    if (data) setTools(data);
  };

  const handleEdit = (benchmark: Benchmark) => {
    setEditingId(benchmark.id);
    setEditForm(benchmark);
  };

  const handleSave = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('tool_benchmarks')
      .update({
        benchmark_name: editForm.benchmark_name,
        benchmark_category: editForm.benchmark_category,
        score: editForm.score,
        test_description: editForm.test_description,
        metrics: editForm.metrics
      })
      .eq('id', editingId);

    if (!error) {
      setEditingId(null);
      setEditForm({});
      loadBenchmarks();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this benchmark?')) return;

    const { error } = await supabase
      .from('tool_benchmarks')
      .delete()
      .eq('id', id);

    if (!error) {
      loadBenchmarks();
    }
  };

  const handleAddBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const metricsObj = JSON.parse(newBenchmark.metrics || '{}');

      const { error } = await supabase
        .from('tool_benchmarks')
        .insert({
          tool_id: newBenchmark.tool_id,
          benchmark_name: newBenchmark.benchmark_name,
          benchmark_category: newBenchmark.benchmark_category,
          score: parseFloat(newBenchmark.score),
          test_description: newBenchmark.test_description,
          test_date: new Date().toISOString(),
          metrics: metricsObj
        });

      if (!error) {
        setShowAddModal(false);
        setNewBenchmark({
          tool_id: '',
          benchmark_name: '',
          benchmark_category: 'speed',
          score: '',
          test_description: '',
          metrics: '{}'
        });
        loadBenchmarks();
      }
    } catch (error) {
      alert('Invalid metrics JSON');
    }
  };

  const handleApproveSubmission = async (submission: SubmittedBenchmark) => {
    const { error: insertError } = await supabase
      .from('tool_benchmarks')
      .insert({
        tool_id: submission.tool_id,
        benchmark_name: submission.benchmark_name,
        benchmark_category: submission.test_results?.category || 'speed',
        score: submission.score,
        test_description: submission.test_description,
        test_date: new Date().toISOString(),
        metrics: submission.test_results || {}
      });

    if (!insertError) {
      await supabase
        .from('user_submitted_benchmarks')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      loadData();
    }
  };

  const handleRejectSubmission = async (id: string) => {
    await supabase
      .from('user_submitted_benchmarks')
      .update({ status: 'rejected' })
      .eq('id', id);

    loadSubmittedBenchmarks();
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <span>Manage Benchmarks</span>
          </h1>
          <p className="text-slate-400 mt-2">Manage performance benchmarks and review submissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Benchmark</span>
        </button>
      </div>

      <div className="mb-6 flex space-x-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'published'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Published ({benchmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'submitted'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Pending Submissions ({submittedBenchmarks.length})
        </button>
      </div>

      {activeTab === 'published' ? (
        <div className="space-y-4">
          {benchmarks.map(benchmark => (
            <div key={benchmark.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              {editingId === benchmark.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.benchmark_name}
                    onChange={(e) => setEditForm({ ...editForm, benchmark_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="Benchmark Name"
                  />
                  <select
                    value={editForm.benchmark_category}
                    onChange={(e) => setEditForm({ ...editForm, benchmark_category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="speed">Speed</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="cost">Cost Efficiency</option>
                    <option value="quality">Quality</option>
                    <option value="reliability">Reliability</option>
                  </select>
                  <input
                    type="number"
                    value={editForm.score}
                    onChange={(e) => setEditForm({ ...editForm, score: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="Score (0-100)"
                    min="0"
                    max="100"
                  />
                  <textarea
                    value={editForm.test_description}
                    onChange={(e) => setEditForm({ ...editForm, test_description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="Test Description"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                      className="flex items-center space-x-1 px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-500"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{benchmark.tool_name}</h3>
                    <p className="text-slate-300 mb-2">{benchmark.benchmark_name}</p>
                    <p className="text-sm text-slate-400 mb-2">{benchmark.test_description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-cyan-400">Category: {benchmark.benchmark_category}</span>
                      <span className="text-green-400">Score: {benchmark.score}/100</span>
                      <span className="text-slate-500">
                        {new Date(benchmark.test_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(benchmark)}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(benchmark.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {submittedBenchmarks.map(submission => (
            <div key={submission.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{submission.tool_name}</h3>
                  <p className="text-slate-300 mb-2">{submission.benchmark_name}</p>
                  <p className="text-sm text-slate-400 mb-2">{submission.test_description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-cyan-400">
                      Category: {submission.test_results?.category || 'N/A'}
                    </span>
                    <span className="text-green-400">Score: {submission.score}/100</span>
                    <span className="text-slate-500">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveSubmission(submission)}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectSubmission(submission.id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {submittedBenchmarks.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No pending submissions
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Benchmark</h2>
            <form onSubmit={handleAddBenchmark} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tool</label>
                <select
                  required
                  value={newBenchmark.tool_id}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, tool_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="">Select a tool...</option>
                  {tools.map(tool => (
                    <option key={tool.id} value={tool.id}>{tool.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Benchmark Name</label>
                <input
                  required
                  type="text"
                  value={newBenchmark.benchmark_name}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, benchmark_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  required
                  value={newBenchmark.benchmark_category}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, benchmark_category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="speed">Speed</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="cost">Cost Efficiency</option>
                  <option value="quality">Quality</option>
                  <option value="reliability">Reliability</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Score (0-100)</label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newBenchmark.score}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, score: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Test Description</label>
                <textarea
                  required
                  value={newBenchmark.test_description}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, test_description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Metrics (JSON format)
                </label>
                <textarea
                  value={newBenchmark.metrics}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, metrics: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white font-mono text-sm"
                  rows={3}
                  placeholder='{"latency": "100ms", "throughput": "1000 req/s"}'
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded hover:from-cyan-600 hover:to-blue-600"
                >
                  Add Benchmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
