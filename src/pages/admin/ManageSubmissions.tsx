import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase, ToolSubmission } from '../../lib/supabase';

export default function ManageSubmissions() {
  const [submissions, setSubmissions] = useState<ToolSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from('tool_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setSubmissions(data);
    setLoading(false);
  };

  const handleApprove = async (submission: ToolSubmission) => {
    const slug = submission.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('name', submission.category)
      .single();

    const toolData = {
      name: submission.name,
      slug,
      description: submission.description,
      long_description: submission.description,
      logo_url: submission.logo_url,
      website_url: submission.website_url,
      category_id: categories?.id,
      pricing_type: submission.pricing_type,
      status: 'Published',
      tags: [submission.category],
      features: [],
    };

    const { data: newTool } = await supabase.from('ai_tools').insert([toolData]).select().single();
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
    if (filter === 'all') return true;
    return sub.status.toLowerCase() === filter;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Submitted Tools</h1>
        <p className="text-slate-400">Review and approve user submissions</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'pending'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'approved'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'rejected'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
          <p className="text-slate-400">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{submission.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        submission.status === 'Pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : submission.status === 'Approved'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-slate-400 text-sm">Category:</span>
                      <span className="text-white ml-2">{submission.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Pricing:</span>
                      <span className="text-white ml-2">{submission.pricing_type}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-3">{submission.description}</p>

                  <div className="flex items-center space-x-4 text-sm mb-3">
                    <a
                      href={submission.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Visit Website</span>
                    </a>
                    {submission.submitter_email && (
                      <span className="text-slate-500">
                        Submitted by: {submission.submitter_email}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    Submitted on {new Date(submission.created_at).toLocaleDateString()}
                  </div>
                </div>

                {submission.status === 'Pending' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(submission)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(submission.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
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
