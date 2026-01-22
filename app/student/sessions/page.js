'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Clock, Star, Video, User, FileText, ExternalLink, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StudentReviewModal from '@/components/student/ReviewForm';
import AssignmentCard from '@/components/student/AssignmentCard';
import { getTimeUntil, canJoinMeeting, isUpcoming } from '@/lib/utils';

export default function StudentSessionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    if (!email) {
      router.push('/student/login');
      return;
    }
    setUserEmail(email);
    fetchData(email);
  }, []);

  const fetchData = async (email) => {
    try {
      const profileRes = await fetch(`/api/users/profile?email=${email}`);
      const profileData = await profileRes.json();
      
      if (!profileData.success) {
        throw new Error('Failed to get profile');
      }

      const sId = profileData.user.id;
      setStudentId(sId);

      const sessionsRes = await fetch(`/api/sessions?studentId=${sId}`);
      const sessionsData = await sessionsRes.json();
      
      if (sessionsData.success) {
        setSessions(sessionsData.sessions);
      }

      // Fetch assignments
      const assignmentsRes = await fetch(`/api/assignments?studentId=${sId}`);
      const assignmentsData = await assignmentsRes.json();
      
      if (assignmentsData.success) {
        setAssignments(assignmentsData.assignments);
      }

    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && isUpcoming(s.scheduledStartTime));
  const pendingReview = sessions.filter(s => s.status === 'completed' && !s.studentConfirmed);
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.studentConfirmed);
  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');
  const gradedAssignments = assignments.filter(a => a.status === 'graded');

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">My Sessions</h1>
        <p className="text-sm sm:text-base text-gray-600">View your scheduled classes and assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{sessions.length}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Sessions</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{upcomingSessions.length}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Upcoming</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingReview.length}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">To Review</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-purple-600">{assignments.length}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Assignments</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <UpcomingSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">📝 Pending Assignments</h2>
          <div className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment}
                onSuccess={() => fetchData(userEmail)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Submitted Assignments (Awaiting Grade) */}
      {submittedAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">⏳ Awaiting Grading</h2>
          <div className="space-y-4">
            {submittedAssignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment}
                onSuccess={() => fetchData(userEmail)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Review */}
      {pendingReview.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">⭐ Pending Review</h2>
          <div className="space-y-4">
            {pendingReview.map((session) => (
              <PendingReviewCard 
                key={session.id} 
                session={session}
                onReview={(s) => {
                  setSelectedSession(s);
                  setShowReviewModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Graded Assignments */}
      {gradedAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">✅ Graded Assignments</h2>
          <div className="space-y-4">
            {gradedAssignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment}
                onSuccess={() => fetchData(userEmail)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Session History */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Session History</h2>
        {completedSessions.length > 0 ? (
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <CompletedSessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No completed sessions yet</h3>
            <p className="text-sm sm:text-base text-gray-500">Your session history will appear here</p>
          </div>
        )}
      </div>

      <StudentReviewModal
        show={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSuccess={() => fetchData(userEmail)}
      />
    </div>
  );
}

function UpcomingSessionCard({ session }) {
  const timeUntil = getTimeUntil(session.scheduledStartTime);
  const canJoin = canJoinMeeting(session.scheduledStartTime);

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="bg-green-500 p-2 sm:p-3 rounded-full flex-shrink-0">
            <Calendar className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">{session.topic || 'Session'}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              <User size={12} className="inline mr-1" />
              {session.tutorName}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap self-start">
          Starts in {timeUntil}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs mb-1">Date & Time</p>
          <p className="font-semibold text-gray-800 text-xs sm:text-sm">{new Date(session.scheduledStartTime).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Duration</p>
          <p className="font-semibold text-gray-800 text-xs sm:text-sm">{session.duration} min</p>
        </div>
      </div>

      {session.googleMeetLink && (
        <a
          href={session.googleMeetLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
            canJoin
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Video size={18} />
          {canJoin ? 'Join Meeting Now' : `Opens 15 mins before (${timeUntil})`}
        </a>
      )}
    </div>
  );
}

function PendingReviewCard({ session, onReview }) {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="bg-yellow-500 p-2 sm:p-3 rounded-full flex-shrink-0">
            <Star className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">{session.topic || 'Session'}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              <User size={12} className="inline mr-1" />
              {session.tutorName}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 whitespace-nowrap self-start">
          ⏳ Awaiting Review
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs mb-1">Date</p>
          <p className="font-semibold text-gray-800 text-xs sm:text-sm">{new Date(session.scheduledStartTime).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Duration</p>
          <p className="font-semibold text-gray-800 text-xs sm:text-sm">{session.duration} min</p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 mb-4">
        Your tutor has marked this session as complete. Please share your feedback!
      </p>

      <button
        onClick={() => onReview(session)}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
      >
        <Star size={18} />
        Rate This Session
      </button>
    </div>
  );
}

function CompletedSessionCard({ session }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
            <BookOpen className="text-purple-600" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{session.topic || 'Session'}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              <User size={12} className="inline mr-1" />
              {session.tutorName}
            </p>
          </div>
        </div>
        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap self-start">
          ✓ Completed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="flex-shrink-0" />
          <span className="truncate">{new Date(session.scheduledStartTime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="flex-shrink-0" />
          <span>{session.duration} min</span>
        </div>
        {session.studentRating && (
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-500" size={14} />
            <span className="font-semibold">{session.studentRating}/5</span>
          </div>
        )}
      </div>

      {session.studentReview && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs font-semibold text-purple-800 mb-1">Your Review:</p>
          <p className="text-xs sm:text-sm text-purple-700">{session.studentReview}</p>
        </div>
      )}
    </div>
  );
}