'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Loader2, BookOpen, FileText } from 'lucide-react';
import { formatDateTimeLocal, parseDateTimeLocal } from '@/lib/utils';

export default function ScheduleSessionModal({ 
  show, 
  onClose, 
  pairings,
  tutorId,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    pairingId: '',
    sessionDate: '',
    duration: 60,
    topic: '',
    googleMeetLink: '',
    moduleId: '',
    sessionId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [curriculum, setCurriculum] = useState([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // Fetch curriculum when pairing is selected
  useEffect(() => {
    if (formData.pairingId) {
      const selectedPairing = pairings.find(p => p.id === formData.pairingId);
      if (selectedPairing?.courseId) {
        fetchCurriculum(selectedPairing.courseId);
      }
    } else {
      setCurriculum([]);
      setFormData(prev => ({ ...prev, moduleId: '', sessionId: '', topic: '' }));
    }
  }, [formData.pairingId, pairings]);

  // Auto-fill topic when session is selected
  useEffect(() => {
    if (formData.moduleId && formData.sessionId) {
      const module = curriculum.find(m => m.id === formData.moduleId);
      const session = module?.sessions.find(s => s.id === formData.sessionId);
      if (session) {
        setFormData(prev => ({ ...prev, topic: session.title }));
      }
    }
  }, [formData.moduleId, formData.sessionId, curriculum]);

  const fetchCurriculum = async (courseId) => {
    setLoadingCurriculum(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`);
      const data = await response.json();
      
      if (data.success && data.curriculum) {
        setCurriculum(data.curriculum);
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setLoadingCurriculum(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.pairingId || !formData.sessionDate) {
      setError('Please select a student and date/time');
      return;
    }

    if (!formData.topic.trim()) {
      setError('Please enter a session topic');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const selectedPairing = pairings.find(p => p.id === formData.pairingId);
      const tutorEmail = sessionStorage.getItem('userEmail');

      const response = await fetch('/api/sessions/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId,
          tutorEmail,
          pairingId: formData.pairingId,
          sessionDate: formData.sessionDate,
          duration: formData.duration,
          topic: formData.topic,
          googleMeetLink: formData.googleMeetLink,
          // NEW: Curriculum tracking
          moduleId: formData.moduleId || null,
          sessionId: formData.sessionId || null,
          curriculumSession: formData.sessionId ? {
            moduleId: formData.moduleId,
            sessionId: formData.sessionId,
            moduleTitle: curriculum.find(m => m.id === formData.moduleId)?.title || '',
            sessionTitle: formData.topic
          } : null
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          pairingId: '',
          sessionDate: '',
          duration: 60,
          topic: '',
          googleMeetLink: '',
          moduleId: '',
          sessionId: ''
        });
      } else {
        setError(data.error || 'Failed to schedule session');
      }
    } catch (err) {
      console.error('Schedule error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  const selectedPairing = pairings.find(p => p.id === formData.pairingId);
  const selectedModule = curriculum.find(m => m.id === formData.moduleId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 sm:p-6 text-white sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Schedule Session</h3>
              <p className="text-blue-50 text-xs sm:text-sm">Plan your next teaching session</p>
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

          <div className="space-y-4 sm:space-y-5">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Student *
              </label>
              <select
                value={formData.pairingId}
                onChange={(e) => setFormData({...formData, pairingId: e.target.value})}
                disabled={submitting}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm sm:text-base text-gray-900 disabled:opacity-50 bg-white"
              >
                <option value="">Choose a student...</option>
                {pairings.map(pairing => (
                  <option key={pairing.id} value={pairing.id}>
                    {pairing.studentName} - {pairing.courseName}
                  </option>
                ))}
              </select>
            </div>

            {/* Curriculum Selection (if available) */}
            {formData.pairingId && (
              <>
                {loadingCurriculum ? (
                  <div className="flex items-center justify-center py-4 text-gray-500">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    <span className="text-sm">Loading curriculum...</span>
                  </div>
                ) : curriculum.length > 0 ? (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-purple-800">
                      <BookOpen size={18} />
                      <span className="font-semibold text-sm sm:text-base">📚 Follow Curriculum (Optional)</span>
                    </div>

                    {/* Module Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Module
                      </label>
                      <select
                        value={formData.moduleId}
                        onChange={(e) => setFormData({...formData, moduleId: e.target.value, sessionId: ''})}
                        disabled={submitting}
                        className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm text-gray-900 bg-white"
                      >
                        <option value="">Choose module or enter custom topic below</option>
                        {curriculum.map((module, idx) => (
                          <option key={module.id} value={module.id}>
                            Module {idx + 1}: {module.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Session Selection (if module selected) */}
                    {formData.moduleId && selectedModule && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Session
                        </label>
                        <select
                          value={formData.sessionId}
                          onChange={(e) => setFormData({...formData, sessionId: e.target.value})}
                          disabled={submitting}
                          className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm text-gray-900 bg-white"
                        >
                          <option value="">Choose a session...</option>
                          {selectedModule.sessions.map((session, idx) => (
                            <option key={session.id} value={session.id}>
                              Session {idx + 1}: {session.title}
                            </option>
                          ))}
                        </select>
                        
                        {/* Session Preview */}
                        {formData.sessionId && (() => {
                          const session = selectedModule.sessions.find(s => s.id === formData.sessionId);
                          return session ? (
                            <div className="mt-3 p-3 bg-white rounded-lg border-2 border-purple-200">
                              <div className="flex items-start gap-2">
                                <FileText size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-purple-800 mb-1">{session.title}</p>
                                  {session.description && (
                                    <p className="text-xs text-gray-600">{session.description}</p>
                                  )}
                                  {session.duration && (
                                    <p className="text-xs text-gray-500 mt-1">📚 Duration: {session.duration}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                    <BookOpen className="mx-auto text-blue-400 mb-2" size={32} />
                    <p className="text-sm text-blue-800 font-medium">No curriculum available</p>
                    <p className="text-xs text-blue-600 mt-1">Enter a custom topic below</p>
                  </div>
                )}
              </>
            )}

            {/* Topic (Manual or Auto-filled) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session Topic *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                disabled={submitting}
                placeholder="e.g., Introduction to Variables"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
              {formData.sessionId && (
                <p className="text-xs text-gray-500 mt-1">✓ Auto-filled from curriculum (you can edit)</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline mr-1" size={16} />
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({...formData, sessionDate: e.target.value})}
                  disabled={submitting}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm sm:text-base text-gray-900 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="inline mr-1" size={16} />
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  disabled={submitting}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm sm:text-base text-gray-900 disabled:opacity-50 bg-white"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            {/* Google Meet Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Video className="inline mr-1" size={16} />
                Google Meet Link
              </label>
              <input
                type="url"
                value={formData.googleMeetLink}
                onChange={(e) => setFormData({...formData, googleMeetLink: e.target.value})}
                disabled={submitting}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>💡 Tip:</strong> {curriculum.length > 0 
                  ? 'Select a session from the curriculum to auto-fill the topic and track progress!'
                  : 'Students will receive an email notification with the meeting link.'}
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
              disabled={submitting || !formData.pairingId || !formData.sessionDate || !formData.topic}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="hidden sm:inline">Scheduling...</span>
                  <span className="sm:hidden">Wait...</span>
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  <span className="hidden sm:inline">Schedule Session</span>
                  <span className="sm:hidden">Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}