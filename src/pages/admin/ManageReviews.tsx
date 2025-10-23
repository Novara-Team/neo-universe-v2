import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Edit2, X, Save, Star, MessageSquare, User, Calendar, ThumbsUp, AlertCircle } from 'lucide-react';
import { supabase, ToolReview } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';

type ReviewWithTool = ToolReview & {
  tool?: { name: string; slug: string };
};

interface EditFormData {
  review_title?: string;
  rating: number;
  review_text: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
}

export default function ManageReviews() {
  const [reviews, setReviews] = useState<ReviewWithTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [editingReview, setEditingReview] = useState<ReviewWithTool | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    rating: 5,
    review_text: '',
    pros: [],
    cons: []
  });
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('tool_reviews')
      .select('*, tool:ai_tools(name, slug)')
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
    setEditForm({
      review_title: review.review_title || '',
      rating: review.rating || 5,
      review_text: review.review_text || review.comment || '',
      comment: review.comment || '',
      pros: review.pros || [],
      cons: review.cons || []
    });
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditForm({
      rating: 5,
      review_text: '',
      pros: [],
      cons: []
    });
    setNewPro('');
    setNewCon('');
  };

  const saveEdit = async () => {
    if (!editingReview) return;

    await supabase
      .from('tool_reviews')
      .update({
        review_title: editForm.review_title,
        rating: editForm.rating,
        review_text: editForm.review_text,
        comment: editForm.review_text,
        pros: editForm.pros,
        cons: editForm.cons,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingReview.id);

    cancelEdit();
    loadReviews();
  };

  const addPro = () => {
    if (newPro.trim()) {
      setEditForm({ ...editForm, pros: [...(editForm.pros || []), newPro.trim()] });
      setNewPro('');
    }
  };

  const removePro = (index: number) => {
    setEditForm({
      ...editForm,
      pros: editForm.pros?.filter((_, i) => i !== index)
    });
  };

  const addCon = () => {
    if (newCon.trim()) {
      setEditForm({ ...editForm, cons: [...(editForm.cons || []), newCon.trim()] });
      setNewCon('');
    }
  };

  const removeCon = (index: number) => {
    setEditForm({
      ...editForm,
      cons: editForm.cons?.filter((_, i) => i !== index)
    });
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'approved') return review.approved;
    if (filter === 'pending') return !review.approved;
    return true;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.approved).length,
    pending: reviews.filter(r => !r.approved).length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Reviews Management</h1>
          </div>
          <p className="text-slate-400 text-lg">Moderate and manage user reviews and feedback</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-slate-300 font-medium">Total Reviews</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{stats.approved}</span>
            </div>
            <p className="text-slate-300 font-medium">Approved</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{stats.pending}</span>
            </div>
            <p className="text-slate-300 font-medium">Pending</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-amber-400" />
              <span className="text-3xl font-bold text-white">{stats.avgRating}</span>
            </div>
            <p className="text-slate-300 font-medium">Avg Rating</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            All Reviews ({stats.total})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'approved'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/50'
                : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            Pending ({stats.pending})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all"
              >
                {editingReview?.id === review.id ? (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <Edit2 className="w-5 h-5 text-cyan-400" />
                        <span>Edit Review</span>
                      </h3>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Review Title</label>
                      <input
                        type="text"
                        value={editForm.review_title || ''}
                        onChange={(e) => setEditForm({ ...editForm, review_title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter review title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Rating: {editForm.rating}/5
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setEditForm({ ...editForm, rating: star })}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= editForm.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Review Text</label>
                      <textarea
                        value={editForm.review_text}
                        onChange={(e) => setEditForm({ ...editForm, review_text: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        rows={4}
                        placeholder="Enter review text..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Pros</label>
                        <div className="space-y-2 mb-3">
                          {editForm.pros?.map((pro, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                              <span className="text-green-400 flex-1">{pro}</span>
                              <button
                                onClick={() => removePro(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newPro}
                            onChange={(e) => setNewPro(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addPro()}
                            className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm"
                            placeholder="Add a pro..."
                          />
                          <button
                            onClick={addPro}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Cons</label>
                        <div className="space-y-2 mb-3">
                          {editForm.cons?.map((con, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                              <span className="text-red-400 flex-1">{con}</span>
                              <button
                                onClick={() => removeCon(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newCon}
                            onChange={(e) => setNewCon(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCon()}
                            className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm"
                            placeholder="Add a con..."
                          />
                          <button
                            onClick={addCon}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={saveEdit}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50 font-medium"
                      >
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{review.user_name}</h3>
                              <p className="text-slate-400 text-sm">{review.user_email}</p>
                            </div>
                          </div>

                          {review.review_title && (
                            <h4 className="text-lg font-bold text-white mb-2">{review.review_title}</h4>
                          )}

                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.approved ? (
                              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                Approved
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                                Pending
                              </span>
                            )}
                          </div>

                          <p className="text-slate-300 mb-4 leading-relaxed">
                            {review.review_text || review.comment}
                          </p>

                          {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {review.pros && review.pros.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-semibold text-green-400 mb-2">Pros</h5>
                                  <ul className="space-y-1">
                                    {review.pros.map((pro, index) => (
                                      <li key={index} className="text-sm text-slate-300 flex items-start space-x-2">
                                        <span className="text-green-400 mt-1">+</span>
                                        <span>{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {review.cons && review.cons.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-semibold text-red-400 mb-2">Cons</h5>
                                  <ul className="space-y-1">
                                    {review.cons.map((con, index) => (
                                      <li key={index} className="text-sm text-slate-300 flex items-start space-x-2">
                                        <span className="text-red-400 mt-1">-</span>
                                        <span>{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : null}

                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            </span>
                            <span>•</span>
                            <span>Tool: {review.tool?.name}</span>
                            {review.helpful_count > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>{review.helpful_count} helpful</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          {!review.approved && (
                            <button
                              onClick={() => handleApprove(review.id)}
                              className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {review.approved && (
                            <button
                              onClick={() => handleReject(review.id)}
                              className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                              title="Unapprove"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(review)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
