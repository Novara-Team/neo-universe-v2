import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Edit2, X } from 'lucide-react';
import { supabase, ToolReview } from '../../lib/supabase';

type ReviewWithTool = ToolReview & {
  tool?: { name: string };
};

export default function ManageReviews() {
  const [reviews, setReviews] = useState<ReviewWithTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [editingReview, setEditingReview] = useState<ReviewWithTool | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('tool_reviews')
      .select('*, tool:ai_tools(name)')
      .order('created_at', { ascending: false });

    if (data) setReviews(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    await supabase.from('tool_reviews').update({ approved: true }).eq('id', id);
    loadReviews();
  };

  const handleReject = async (id: string) => {
    await supabase.from('tool_reviews').update({ approved: false }).eq('id', id);
    loadReviews();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await supabase.from('tool_reviews').delete().eq('id', id);
      loadReviews();
    }
  };

  const startEdit = (review: ReviewWithTool) => {
    setEditingReview(review);
    setEditText(review.comment || review.review_text || '');
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditText('');
  };

  const saveEdit = async () => {
    if (!editingReview) return;

    await supabase
      .from('tool_reviews')
      .update({
        comment: editText,
        review_text: editText,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingReview.id);

    cancelEdit();
    loadReviews();
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'approved') return review.approved;
    if (filter === 'pending') return !review.approved;
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reviews & Comments</h1>
        <p className="text-slate-400">Moderate user reviews and feedback</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All Reviews
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
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'pending'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Pending
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
          <p className="text-slate-400">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-white font-semibold">{review.user_name}</h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-slate-600'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {review.approved ? (
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{review.user_email}</p>
                  {editingReview?.id === review.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 mb-2">{review.comment || review.review_text}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>Tool: {review.tool?.name}</span>
                    <span>•</span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    {review.helpful_count > 0 && (
                      <>
                        <span>•</span>
                        <span>{review.helpful_count} helpful</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                      title="Unapprove"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(review)}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
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