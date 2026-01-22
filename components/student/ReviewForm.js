'use client';

import { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';

export default function StudentReviewModal({ 
  show, 
  onClose, 
  session,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    rating: 5,
    review: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.rating) {
      setError('Please provide a rating');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const studentEmail = sessionStorage.getItem('userEmail');

      const response = await fetch(`/api/sessions/${session.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail,
          studentRating: formData.rating,
          studentReview: formData.review
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !session) return null;

  const getRatingText = () => {
    switch(formData.rating) {
      case 5: return '⭐ Excellent!';
      case 4: return '👍 Very Good';
      case 3: return '👌 Good';
      case 2: return '😐 Fair';
      case 1: return '😞 Needs Improvement';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 sm:p-6 text-white sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Rate Your Session</h3>
              <p className="text-purple-50 text-xs sm:text-sm">Share your experience</p>
            </div>
            <button 
              onClick={onClose} 
              disabled={submitting}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-xs sm:text-sm text-red-600 font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Session Info */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-1"><strong>Tutor:</strong> {session.tutorName}</p>
            <p className="text-xs sm:text-sm text-gray-600 mb-1"><strong>Topic:</strong> {session.topic || 'Session'}</p>
            <p className="text-xs sm:text-sm text-gray-600"><strong>Date:</strong> {new Date(session.scheduledStartTime).toLocaleString()}</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How would you rate this session? *
              </label>
              <div className="flex justify-center gap-2 sm:gap-3 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFormData({...formData, rating: star})}
                    disabled={submitting}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                    type="button"
                  >
                    <Star
                      size={window.innerWidth < 640 ? 36 : 44}
                      className={star <= formData.rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm sm:text-base font-medium text-gray-700">
                {getRatingText()}
              </p>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                value={formData.review}
                onChange={(e) => setFormData({...formData, review: e.target.value})}
                disabled={submitting}
                placeholder="What did you learn? How was the session? Any suggestions for your tutor?"
                rows={5}
                maxLength={500}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none text-sm sm:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.review.length}/500 characters
              </p>
            </div>

            {/* Info */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-purple-800">
                <strong>💡 Your feedback matters!</strong> It helps your tutor improve and contributes to their performance rating on our platform.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.rating}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="hidden sm:inline">Submitting...</span>
                  <span className="sm:hidden">Wait...</span>
                </>
              ) : (
                <>
                  <Star size={18} />
                  <span className="hidden sm:inline">Submit Review</span>
                  <span className="sm:hidden">Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}