'use client';

import { useEffect, useState } from 'react';
import { Star, TrendingUp, Users, Award, AlertTriangle, MessageSquare, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedView, setSelectedView] = useState('reviews'); // 'reviews' or 'performance'
  const [filterRating, setFilterRating] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all tutors
      const tutorsRes = await fetch('/api/admin/tutors');
      const tutorsData = await tutorsRes.json();
      
      if (tutorsData.success) {
        const activeTutors = tutorsData.tutors.filter(t => t.tutorStatus === 'active');
        setTutors(activeTutors);
      }

      // Get all sessions (with admin flag)
      const sessionsRes = await fetch('/api/sessions?all=true');
      const sessionsData = await sessionsRes.json();
      
      if (sessionsData.success) {
        // Only sessions with student reviews
        const reviewedSessions = sessionsData.sessions.filter(s => 
          s.studentRating && s.studentRating > 0
        );
        console.log('📊 [ADMIN] Total sessions:', sessionsData.sessions.length);
        console.log('📊 [ADMIN] Reviewed sessions:', reviewedSessions.length);
        setSessions(reviewedSessions);
      }
      
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculatePerformance = async (tutorId) => {
    if (!confirm('Recalculate performance for this tutor?')) return;

    try {
      const response = await fetch('/api/tutors/calculate-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Performance recalculated!\n\nScore: ${data.performanceScore}\nTier: ${data.tier}\nMax Students: ${data.maxStudents}`);
        fetchData();
      } else {
        alert(`❌ Error: ${data.error || 'Failed to recalculate'}`);
      }
    } catch (error) {
      alert('Failed to recalculate performance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  // Calculate stats
  const totalReviews = sessions.length;
  const avgRating = totalReviews > 0 
    ? (sessions.reduce((sum, s) => sum + s.studentRating, 0) / totalReviews).toFixed(1)
    : 0;

  const filteredSessions = filterRating === 'all' 
    ? sessions 
    : sessions.filter(s => s.studentRating === parseInt(filterRating));

  const filteredByTutor = selectedTutor
    ? filteredSessions.filter(s => s.tutorId === selectedTutor)
    : filteredSessions;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          Tutor Performance & Feedback
        </h1>
        <p className="text-sm sm:text-base text-gray-600">Monitor tutor performance and student reviews</p>
      </div>

      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => setSelectedView('reviews')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-sm sm:text-base ${
            selectedView === 'reviews'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <MessageSquare className="inline mr-2" size={18} />
          Student Reviews ({totalReviews})
        </button>
        <button
          onClick={() => setSelectedView('performance')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-sm sm:text-base ${
            selectedView === 'performance'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <TrendingUp className="inline mr-2" size={18} />
          Tutor Performance ({tutors.length})
        </button>
      </div>

      {/* REVIEWS VIEW */}
      {selectedView === 'reviews' && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalReviews}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Reviews</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{avgRating}⭐</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Avg Rating</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {sessions.filter(s => s.studentRating === 5).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">5-Star</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                {sessions.filter(s => s.studentRating <= 3).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Low Rated</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                {tutors.filter(t => t.pairingTier === 3).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Tier 3</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-gray-600" />
              <h3 className="font-bold text-gray-800 text-base sm:text-lg">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                  <option value="3">⭐⭐⭐ (3 stars)</option>
                  <option value="2">⭐⭐ (2 stars)</option>
                  <option value="1">⭐ (1 star)</option>
                </select>
              </div>

              {/* Tutor Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tutor</label>
                <select
                  value={selectedTutor || ''}
                  onChange={(e) => setSelectedTutor(e.target.value || null)}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm"
                >
                  <option value="">All Tutors</option>
                  {tutors.map(tutor => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredByTutor.length > 0 ? (
              filteredByTutor.map(session => (
                <ReviewCard key={session.id} session={session} />
              ))
            ) : (
              <div className="bg-white rounded-xl border-2 border-gray-100 p-8 sm:p-12 text-center">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No reviews found</h3>
                <p className="text-sm sm:text-base text-gray-500">
                  {totalReviews === 0 
                    ? 'No reviews have been submitted yet.' 
                    : 'Try adjusting your filters'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PERFORMANCE VIEW */}
      {selectedView === 'performance' && (
        <div>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{tutors.length}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Active Tutors</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {tutors.filter(t => t.pairingTier === 3).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Tier 3 Tutors</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                {tutors.filter(t => t.pairingTier === 2).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Tier 2 Tutors</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-600">
                {tutors.filter(t => t.pairingTier === 1).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Tier 1 Tutors</p>
            </div>
          </div>

          {/* Tutors List */}
          <div className="space-y-4">
            {tutors.map(tutor => (
              <TutorPerformanceCard
                key={tutor.id}
                tutor={tutor}
                onRecalculate={() => handleRecalculatePerformance(tutor.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ session }) {
  const getRatingColor = (rating) => {
    if (rating === 5) return 'green';
    if (rating === 4) return 'blue';
    if (rating === 3) return 'yellow';
    return 'red';
  };

  const ratingColor = getRatingColor(session.studentRating);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${ratingColor}-100 text-${ratingColor}-700`}>
              {'⭐'.repeat(session.studentRating)} {session.studentRating}/5
            </span>
            <span className="text-xs text-gray-500">
              {new Date(session.scheduledStartTime).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1">
            {session.topic || 'Session'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Student: <span className="font-semibold">{session.studentName}</span> | 
            Tutor: <span className="font-semibold">{session.tutorName}</span>
          </p>
        </div>
      </div>

      {session.studentReview && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-700 italic">"{session.studentReview}"</p>
        </div>
      )}

      {session.studentAttended === false && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ⚠️ Student marked as absent by tutor
        </div>
      )}
    </div>
  );
}

function TutorPerformanceCard({ tutor, onRecalculate }) {
  const [showTierModal, setShowTierModal] = useState(false);

  const getTierColor = (tier) => {
    if (tier === 3) return 'green';
    if (tier === 2) return 'orange';
    return 'gray';
  };

  const tierColor = getTierColor(tutor.pairingTier || 1);
  const performanceScore = tutor.performanceScore || 0;
  const metrics = tutor.performanceMetrics || {};

  const handleManualTierChange = async (newTier, reason) => {
    try {
      const response = await fetch('/api/tutors/update-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutor.id,
          newTier,
          reason,
          adminEmail: sessionStorage.getItem('userEmail')
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Tier updated!\n\nOld: Tier ${data.oldTier} (${data.oldMaxStudents} students)\nNew: Tier ${data.newTier} (${data.newMaxStudents} students)`);
        window.location.reload();
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      alert('Error updating tier');
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1">{tutor.email}</h3>
          <p className="text-xs sm:text-sm text-gray-600">
            <Users size={14} className="inline mr-1" />
            {tutor.currentStudentCount || 0}/{tutor.maxConcurrentStudents || 1} Students
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${tierColor}-100 text-${tierColor}-700`}>
            Tier {tutor.pairingTier || 1}
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{performanceScore}</p>
          <p className="text-xs text-gray-500">Performance Score</p>
        </div>
      </div>

      {/* Performance Breakdown */}
      {metrics.attendance !== undefined && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-semibold">Attendance</p>
            <p className="text-base sm:text-lg font-bold text-blue-700">{metrics.attendance}%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 font-semibold">Assignments</p>
            <p className="text-base sm:text-lg font-bold text-green-700">{metrics.assignments}%</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-xs text-orange-600 font-semibold">Exams</p>
            <p className="text-base sm:text-lg font-bold text-orange-700">{metrics.exams}%</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-600 font-semibold">Ratings</p>
            <p className="text-base sm:text-lg font-bold text-purple-700">{metrics.reviews}%</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRecalculate}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <TrendingUp size={16} />
          Recalculate
        </button>
        <button
          onClick={() => setShowTierModal(true)}
          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Award size={16} />
          Change Tier
        </button>
        {performanceScore < 60 && (
          <div className="flex-1 bg-red-50 border-2 border-red-200 rounded-lg p-2 flex items-center justify-center gap-2">
            <AlertTriangle className="text-red-600" size={16} />
            <span className="text-xs sm:text-sm font-semibold text-red-700">Low Performance</span>
          </div>
        )}
      </div>

      {/* Manual Tier Change Modal */}
      {showTierModal && (
        <ManualTierModal
          tutor={tutor}
          onClose={() => setShowTierModal(false)}
          onConfirm={handleManualTierChange}
        />
      )}

      {tutor.lastPerformanceUpdate && (
        <p className="text-xs text-gray-500 mt-3">
          Last updated: {new Date(tutor.lastPerformanceUpdate).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function ManualTierModal({ tutor, onClose, onConfirm }) {
  const [selectedTier, setSelectedTier] = useState(tutor.pairingTier || 1);
  const [reason, setReason] = useState('');

  const tierInfo = {
    1: { students: 1, color: 'gray', desc: 'New/Standard' },
    2: { students: 3, color: 'orange', desc: 'Experienced' },
    3: { students: 6, color: 'green', desc: 'Expert' }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <h3 className="text-2xl font-bold mb-4">Manual Tier Override</h3>
        
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Warning:</strong> Manual tier changes override automatic performance calculations. 
            Current students: {tutor.currentStudentCount || 0}
          </p>
        </div>

        {/* Tier Selection */}
        <div className="space-y-3 mb-4">
          {[1, 2, 3].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedTier === tier
                  ? `border-${tierInfo[tier].color}-500 bg-${tierInfo[tier].color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="font-bold text-gray-800">Tier {tier} - {tierInfo[tier].desc}</p>
                  <p className="text-sm text-gray-600">{tierInfo[tier].students} concurrent students max</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Reason for Override *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you're manually changing this tutor's tier..."
            rows={3}
            className="w-full p-3 border-2 rounded-lg"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                alert('Please provide a reason');
                return;
              }
              onConfirm(selectedTier, reason);
              onClose();
            }}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg"
          >
            Update Tier
          </button>
        </div>
      </div>
    </div>
  );
}