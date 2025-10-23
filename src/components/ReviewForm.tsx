import { useState } from 'react';
import { Star, X, Plus, MessageSquare, ThumbsUp, ThumbsDown, Send, Check } from 'lucide-react';
import { createReview } from '../lib/reviews';
import { useAuth } from '../lib/useAuth';

interface ReviewFormProps {
  toolId: string;
  toolName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ toolId, toolName, onSuccess, onCancel }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [pros, setPros] = useState<string[]>(['']);
  const [cons, setCons] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddPro = () => {
    setPros([...pros, '']);
  };

  const handleAddCon = () => {
    setCons([...cons, '']);
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleProChange = (index: number, value: string) => {
    const newPros = [...pros];
    newPros[index] = value;
    setPros(newPros);
  };

  const handleConChange = (index: number, value: string) => {
    const newCons = [...cons];
    newCons[index] = value;
    setCons(newCons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSubmitting(true);
    try {
      const filteredPros = pros.filter(p => p.trim() !== '');
      const filteredCons = cons.filter(c => c.trim() !== '');

      const result = await createReview({
        tool_id: toolId,
        user_id: user.id,
        user_name: profile.full_name || 'Anonymous',
        user_email: profile.email,
        rating,
        title,
        review_text: reviewText,
        pros: filteredPros.length > 0 ? filteredPros : undefined,
        cons: filteredCons.length > 0 ? filteredCons : undefined,
      });

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-12 text-center animate-in fade-in duration-500">
        <div className="inline-flex p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full mb-6">
          <Check className="w-16 h-16 text-green-400" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4">Review Submitted!</h3>
        <p className="text-lg text-slate-300 mb-2">
          Thank you for sharing your experience with {toolName}
        </p>
        <p className="text-sm text-slate-400">
          Your review will be published after admin approval
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Write a Review</h3>
          <p className="text-slate-400">Share your experience with {toolName}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-slate-700/50 rounded-xl transition-all"
        >
          <X className="w-6 h-6 text-slate-400 hover:text-white" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3">
            Rating <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-4 text-lg font-semibold text-white">
                {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
              </span>
            )}
          </div>
          {rating === 0 && (
            <p className="text-xs text-red-400 mt-2">Please select a rating</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3">
            Review Title <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3">
            Your Review <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your detailed experience with this tool. What did you like? How did it help you?"
            rows={6}
            className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all"
          />
          <p className="text-xs text-slate-500 mt-2">{reviewText.length} characters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-bold text-green-400">
                <ThumbsUp className="w-4 h-4" />
                Pros
              </label>
              <button
                type="button"
                onClick={handleAddPro}
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {pros.map((pro, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => handleProChange(index, e.target.value)}
                    placeholder={`Pro #${index + 1}`}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-800/50 border border-green-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all"
                  />
                  {pros.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePro(index)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-bold text-red-400">
                <ThumbsDown className="w-4 h-4" />
                Cons
              </label>
              <button
                type="button"
                onClick={handleAddCon}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {cons.map((con, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => handleConChange(index, e.target.value)}
                    placeholder={`Con #${index + 1}`}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-800/50 border border-red-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                  />
                  {cons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCon(index)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-700">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0 || !title || !reviewText}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Review
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Your review will be published after moderation to ensure quality and authenticity
          </p>
        </div>
      </div>
    </form>
  );
}
