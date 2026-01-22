'use client';

import { useState } from 'react';
import { X, FileText, Calendar, Loader2, Award } from 'lucide-react';

export function CreateAssignmentModal({ 
  show, 
  onClose, 
  session,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.title) {
      setError('Assignment title is required');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const tutorEmail = sessionStorage.getItem('userEmail');

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorEmail,
          sessionId: session.id,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setFormData({ title: '', description: '', dueDate: '', maxScore: 100 });
      } else {
        setError(data.error || 'Failed to create assignment');
      }
    } catch (err) {
      console.error('Create error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 sm:p-6 text-white sticky top-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1">Create Assignment</h3>
              <p className="text-indigo-50 text-xs sm:text-sm">For {session.studentName}</p>
            </div>
            <button onClick={onClose} disabled={submitting} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-xs sm:text-sm text-red-600 font-medium">⚠️ {error}</p>
            </div>
          )}

          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText size={16} className="inline mr-2" />
                Assignment Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                disabled={submitting}
                placeholder="e.g., Variables Practice Sheet"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                disabled={submitting}
                placeholder="What should the student do?"
                rows={4}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none text-sm sm:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  disabled={submitting}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm sm:text-base text-gray-900 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Award size={16} className="inline mr-2" />
                  Max Score
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value)})}
                  disabled={submitting}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm sm:text-base text-gray-900 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

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
              disabled={submitting || !formData.title}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GradeAssignmentModal({ 
  show, 
  onClose, 
  assignment,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    score: '',
    feedback: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.score || formData.score < 0 || formData.score > (assignment?.maxScore || 100)) {
      setError(`Score must be between 0 and ${assignment?.maxScore || 100}`);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const tutorEmail = sessionStorage.getItem('userEmail');

      const response = await fetch(`/api/assignments/${assignment.id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorEmail,
          score: parseInt(formData.score),
          feedback: formData.feedback
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setFormData({ score: '', feedback: '' });
      } else {
        setError(data.error || 'Failed to grade assignment');
      }
    } catch (err) {
      console.error('Grade error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 sm:p-6 text-white sticky top-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1">Grade Assignment</h3>
              <p className="text-green-50 text-xs sm:text-sm">{assignment.title}</p>
            </div>
            <button onClick={onClose} disabled={submitting} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-xs sm:text-sm text-red-600 font-medium">⚠️ {error}</p>
            </div>
          )}

          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2"><strong>Student:</strong> {assignment.studentName}</p>
            <p className="text-xs sm:text-sm text-gray-600 mb-2"><strong>Submission:</strong></p>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-800 break-all">{assignment.submissionUrl}</p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Award size={16} className="inline mr-2" />
                Score (0-{assignment.maxScore}) *
              </label>
              <input
                type="number"
                min="0"
                max={assignment.maxScore}
                value={formData.score}
                onChange={(e) => setFormData({...formData, score: e.target.value})}
                disabled={submitting}
                placeholder="Enter score"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                disabled={submitting}
                placeholder="Provide feedback to the student..."
                rows={4}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none text-sm sm:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>
          </div>

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
              disabled={submitting || !formData.score}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Grading...
                </>
              ) : (
                <>
                  <Award size={18} />
                  Submit Grade
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}