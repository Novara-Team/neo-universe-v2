import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, User, Globe, DollarSign, Tag, Search, Filter } from 'lucide-react';
import { supabase, ToolSubmission } from '../../lib/supabase';

export default function ManageSubmissions() {
  const [submissions, setSubmissions] = useState<ToolSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from('tool_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setSubmissions(data);
      setStats({
        total: data.length,
        pending: data.filter(s => s.status === 'Pending').length,
        approved: data.filter(s => s.status === 'Approved').length,
        rejected: data.filter(s => s.status === 'Rejected').length
      });
    }
    setLoading(false);
  };

  const handleApprove = async (submission: ToolSubmission) => {
    const slug = submission.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('name', submission.category)
      .maybeSingle();

    const toolData = {
      name: submission.name,
      slug,
      description: submission.description,
      long_description: submission.description,
      logo_url: submission.logo_url || '',
      website_url: submission.website_url,
      category_id: categories?.id || null,
      pricing_type: submission.pricing_type,
      status: 'Published',
      tags: [submission.category],
      features: [],
    };

    const { data: newTool, error: insertError } = await supabase.from('ai_tools').insert([toolData]).select().single();

    if (insertError) {
      console.error('Error creating tool:', insertError);
      alert('Failed to approve submission: ' + insertError.message);
      return;
    }

    await supabase.from('tool_submissions').update({ status: 'Approved' }).eq('id', submission.id);

    if (submission.user_id && newTool) {
      await supabase.from('notifications').insert({
        user_id: submission.user_id,
        type: 'tool_update',
        title: 'Tool Submission Approved!',
        message: `Great news! Your tool "${submission.name}" has been approved and is now live on AI Universe.`,
        link: `/tool/${slug}`,
        metadata: { submission_id: submission.id, tool_id: newTool.id }
      });
    }

    loadSubmissions();
  };

  const handleReject = async (id: string) => {
    const submission = submissions.find(s => s.id === id);
    await supabase.from('tool_submissions').update({ status: 'Rejected' }).eq('id', id);

    if (submission?.user_id) {
      await supabase.from('notifications').insert({
        user_id: submission.user_id,
        type: 'tool_update',
        title: 'Tool Submission Update',
        message: `Thank you for submitting "${submission.name}". Unfortunately, it doesn't meet our criteria at this time. Feel free to submit again with improvements.`,
        link: null,
        metadata: { submission_id: id }
      });
    }

    loadSubmissions();
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesFilter = filter === 'all' || sub.status.toLowerCase() === filter;
    const matchesSearch = !searchQuery ||
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Tool Submissions
        </h1>
        <p className="text-slate-400">
          Review and manage user-submitted AI tools awaiting approval
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-slate-600/50 rounded-xl flex items-center justify-center">
              <Filter className="w-6 h-6 text-slate-300" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Submissions</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-white">{stats.pending}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Approved</p>
          <p className="text-3xl font-bold text-white">{stats.approved}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Rejected</p>
          <p className="text-3xl font-bold text-white">{stats.rejected}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search submissions by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('pending')}
              className={`px-5 py-3 rounded-xl transition-all font-semibold text-sm whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-5 py-3 rounded-xl transition-all font-semibold text-sm whitespace-nowrap ${
                filter === 'approved'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-5 py-3 rounded-xl transition-all font-semibold text-sm whitespace-nowrap ${
                filter === 'rejected'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-3 rounded-xl transition-all font-semibold text-sm whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/20 border-t-cyan-500"></div>
          <p className="text-slate-400 mt-6">Loading submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No submissions found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilter('all');
            }}
            className="px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {submission.name}
                    </h3>
                    <span
                      className={`px-3 py-1.5 text-xs rounded-lg font-bold border ${
                        submission.status === 'Pending'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : submission.status === 'Approved'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-5 leading-relaxed">{submission.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center">
                        <Tag className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-medium">Category</p>
                        <p className="text-white font-semibold">{submission.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-medium">Pricing</p>
                        <p className="text-white font-semibold">{submission.pricing_type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <a
                      href={submission.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all border border-cyan-500/20 font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Visit Website</span>
                    </a>

                    {submission.submitter_email && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-4 h-4" />
                        <span>{submission.submitter_email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {submission.status === 'Pending' && (
                  <div className="flex lg:flex-col gap-3 lg:w-40">
                    <button
                      onClick={() => handleApprove(submission)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-xl transition-all shadow-lg shadow-green-500/30 font-semibold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(submission.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-br from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 rounded-xl transition-all shadow-lg shadow-red-500/30 font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
