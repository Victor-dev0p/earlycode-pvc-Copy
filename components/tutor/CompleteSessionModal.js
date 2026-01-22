'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';

export default function CompleteSessionModal({ 
  show, 
  onClose, 
  session,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    studentAttended: true,
    tutorNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const tutorEmail = sessionStorage.getItem('userEmail');

      const response = await fetch(`/api/sessions/${session.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorEmail,
          studentAttended: formData.studentAttended,
          tutorNotes: formData.tutorNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to complete session');
      }
    } catch (err) {
      console.error('Complete error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Complete Session</h3>
              <p className="text-green-50 text-xs sm:text-sm">Mark session as completed</p>
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
            <p className="text-xs sm:text-sm text-gray-600 mb-1"><strong>Student:</strong> {session.studentName}</p>
            <p className="text-xs sm:text-sm text-gray-600 mb-1"><strong>Topic:</strong> {session.topic || 'Session'}</p>
            <p className="text-xs sm:text-sm text-gray-600"><strong>Date:</strong> {new Date(session.scheduledStartTime).toLocaleString()}</p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {/* Attendance */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Did the student attend this session? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({...formData, studentAttended: true})}
                  disabled={submitting}
                  className={`flex items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-4 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                    formData.studentAttended
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Yes, Attended</span>
                  <span className="sm:hidden">Yes</span>
                </button>
                
                <button
                  onClick={() => setFormData({...formData, studentAttended: false})}
                  disabled={submitting}
                  className={`flex items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-4 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                    !formData.studentAttended
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <XCircle size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">No, Absent</span>
                  <span className="sm:hidden">No</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText size={16} className="inline mr-2" />
                Session Notes (Optional)
              </label>
              <textarea
                value={formData.tutorNotes}
                onChange={(e) => setFormData({...formData, tutorNotes: e.target.value})}
                disabled={submitting}
                placeholder="What was covered in this session? Any observations about student progress?"
                rows={4}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none text-sm sm:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>ℹ️ Note:</strong> After marking this session as completed, the student will be able to rate and review their experience with you.
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
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="hidden sm:inline">Completing...</span>
                  <span className="sm:hidden">Wait...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span className="hidden sm:inline">Mark Complete</span>
                  <span className="sm:hidden">Complete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}