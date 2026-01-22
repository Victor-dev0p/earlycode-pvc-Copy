'use client';

import { useState } from 'react';
import { FileText, Calendar, Award, CheckCircle, Clock, Send } from 'lucide-react';

export default function AssignmentCard({ assignment, onSuccess }) {
  const [showSubmit, setShowSubmit] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!submissionUrl.trim()) {
      setError('Please enter your submission');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const studentEmail = sessionStorage.getItem('userEmail');

      const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail,
          submissionUrl: submissionUrl.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        // FIXED: Use onSuccess prop correctly
        if (onSuccess) {
          onSuccess();
        }
        setShowSubmit(false);
        setSubmissionUrl('');
      } else {
        setError(data.error || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = () => {
    if (assignment.status === 'graded') return 'green';
    if (assignment.status === 'submitted') return 'yellow';
    return 'blue';
  };

  const statusColor = getStatusColor();

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className={`bg-${statusColor}-100 p-2 sm:p-3 rounded-full flex-shrink-0`}>
            <FileText className={`text-${statusColor}-600`} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{assignment.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">Tutor: {assignment.tutorName}</p>
          </div>
        </div>
        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-${statusColor}-100 text-${statusColor}-700 whitespace-nowrap self-start`}>
          {assignment.status === 'pending' && '⏳ Pending'}
          {assignment.status === 'submitted' && '📤 Submitted'}
          {assignment.status === 'graded' && '✓ Graded'}
        </span>
      </div>

      {assignment.description && (
        <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
        {assignment.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="flex-shrink-0" />
            <span className="truncate">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Award size={14} className="flex-shrink-0" />
          <span>Max: {assignment.maxScore} pts</span>
        </div>
      </div>

      {/* Pending Submission */}
      {assignment.status === 'pending' && !showSubmit && (
        <button
          onClick={() => setShowSubmit(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
        >
          <Send size={18} />
          Submit Assignment
        </button>
      )}

      {/* Submission Form */}
      {assignment.status === 'pending' && showSubmit && (
        <div className="border-2 border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
          {error && (
            <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600">⚠️ {error}</p>
            </div>
          )}
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            Your Submission (link or text)
          </label>
          <textarea
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            disabled={submitting}
            placeholder="Paste a link to your work (Google Docs, GitHub, etc.) or write your answer here..."
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none text-xs sm:text-sm text-gray-900 placeholder-gray-400 mb-3 disabled:opacity-50"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowSubmit(false);
                setSubmissionUrl('');
                setError('');
              }}
              disabled={submitting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors text-xs sm:text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !submissionUrl.trim()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {submitting ? (
                <>
                  <Clock className="animate-spin" size={14} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Submitted - Awaiting Grade */}
      {assignment.status === 'submitted' && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-yellow-800 mb-2">
            <strong>Your Submission:</strong>
          </p>
          <p className="text-xs sm:text-sm text-yellow-700 break-all mb-3">{assignment.submissionUrl}</p>
          <div className="flex items-center gap-2 text-yellow-700">
            <Clock size={16} />
            <span className="text-xs sm:text-sm font-medium">Waiting for tutor to grade...</span>
          </div>
        </div>
      )}

      {/* Graded */}
      {assignment.status === 'graded' && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-semibold text-green-800">Your Score:</span>
            <span className="text-xl sm:text-2xl font-bold text-green-600">
              {assignment.score}/{assignment.maxScore}
            </span>
          </div>
          {assignment.feedback && (
            <>
              <p className="text-xs sm:text-sm font-semibold text-green-800 mb-1">Tutor Feedback:</p>
              <p className="text-xs sm:text-sm text-green-700">{assignment.feedback}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}