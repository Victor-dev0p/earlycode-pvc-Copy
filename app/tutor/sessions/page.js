'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Calendar, Clock, CheckCircle, AlertCircle, User, Video, ExternalLink, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ScheduleSessionModal from '@/components/tutor/ScheduleSessionModal';
import CompleteSessionModal from '@/components/tutor/CompleteSessionModal';
import { CreateAssignmentModal, GradeAssignmentModal } from '@/components/tutor/AssignmentModal';
import { getTimeUntil, canJoinMeeting, isUpcoming, isPast } from '@/lib/utils';

export default function TutorSessionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [pairings, setPairings] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showGradeAssignmentModal, setShowGradeAssignmentModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [tutorId, setTutorId] = useState('');

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    if (!email) {
      router.push('/tutor/login');
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

      const tId = profileData.user.id;
      setTutorId(tId);

      const pairingsRes = await fetch(`/api/tutor/pairings?tutorEmail=${email}`);
      const pairingsData = await pairingsRes.json();
      
      if (pairingsData.success) {
        const activePairings = pairingsData.pairings.filter(
          p => p.status === 'accepted' || p.status === 'active'
        );
        setPairings(activePairings);
      }

      const sessionsRes = await fetch(`/api/sessions?tutorId=${tId}`);
      const sessionsData = await sessionsRes.json();
      
      if (sessionsData.success) {
        setSessions(sessionsData.sessions);
      }

      // Fetch assignments
      const assignmentsRes = await fetch(`/api/assignments?tutorId=${tId}`);
      const assignmentsData = await assignmentsRes.json();
      
      if (assignmentsData.success) {
        setAssignments(assignmentsData.assignments);
      }

    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load data');
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
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const pendingConfirmation = sessions.filter(s => s.status === 'completed' && !s.studentConfirmed);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">My Sessions</h1>
          <p className="text-sm sm:text-base text-gray-600">Schedule and manage your teaching sessions</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          disabled={pairings.length === 0}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Schedule Session</span>
          <span className="sm:hidden">Schedule</span>
        </button>
      </div>

      {/* No Pairings Warning */}
      {pairings.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-yellow-800 text-sm sm:text-base">No Active Students</p>
              <p className="text-xs sm:text-sm text-yellow-700">Accept student pairings to start scheduling sessions</p>
            </div>
          </div>
        </div>
      )}

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
          <p className="text-2xl sm:text-3xl font-bold text-purple-600">{completedSessions.length}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-orange-600">{assignments.length}</p>
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

      {/* All Sessions */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">All Sessions</h2>
        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => {
              const sessionAssignments = assignments.filter(a => a.sessionId === session.id);
              return (
                <SessionCard 
                  key={session.id} 
                  session={session}
                  assignments={sessionAssignments}
                  onMarkComplete={(s) => {
                    setSelectedSession(s);
                    setShowCompleteModal(true);
                  }}
                  onCreateAssignment={(s) => {
                    setSelectedSession(s);
                    setShowCreateAssignmentModal(true);
                  }}
                  onGradeAssignment={(a) => {
                    setSelectedAssignment(a);
                    setShowGradeAssignmentModal(true);
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No sessions scheduled yet</h3>
            <p className="text-sm sm:text-base text-gray-500">Schedule your first session to start teaching</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleSessionModal
        show={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        pairings={pairings}
        tutorId={tutorId}
        onSuccess={() => fetchData(userEmail)}
      />

      <CompleteSessionModal
        show={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSuccess={() => fetchData(userEmail)}
      />

      <CreateAssignmentModal
        show={showCreateAssignmentModal}
        onClose={() => {
          setShowCreateAssignmentModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSuccess={() => fetchData(userEmail)}
      />

      <GradeAssignmentModal
        show={showGradeAssignmentModal}
        onClose={() => {
          setShowGradeAssignmentModal(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onSuccess={() => fetchData(userEmail)}
      />
    </div>
  );
}

function UpcomingSessionCard({ session }) {
  const timeUntil = getTimeUntil(session.scheduledStartTime);
  const canJoin = canJoinMeeting(session.scheduledStartTime);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="bg-blue-500 p-2 sm:p-3 rounded-full flex-shrink-0">
            <Calendar className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">{session.topic || 'Session'}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              <User size={12} className="inline mr-1" />
              {session.studentName}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap self-start">
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

function SessionCard({ session, assignments, onMarkComplete, onCreateAssignment, onGradeAssignment }) {
  const getStatusColor = () => {
    if (session.status === 'scheduled') return 'blue';
    if (session.status === 'completed' && session.studentConfirmed) return 'green';
    if (session.status === 'completed' && !session.studentConfirmed) return 'yellow';
    return 'gray';
  };

  const statusColor = getStatusColor();
  const canComplete = session.status === 'scheduled' && isPast(session.scheduledStartTime);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className={`bg-${statusColor}-100 p-2 sm:p-3 rounded-full flex-shrink-0`}>
            <BookOpen className={`text-${statusColor}-600`} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{session.topic || 'Session'}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              <User size={12} className="inline mr-1" />
              {session.studentName}
            </p>
          </div>
        </div>
        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-${statusColor}-100 text-${statusColor}-700 whitespace-nowrap self-start`}>
          {session.status === 'scheduled' && '📅 Scheduled'}
          {session.status === 'completed' && session.studentConfirmed && '✓ Confirmed'}
          {session.status === 'completed' && !session.studentConfirmed && '⏳ Pending'}
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
            <span>⭐</span>
            <span>{session.studentRating}/5</span>
          </div>
        )}
      </div>

      {session.googleMeetLink && (
        <a
          href={session.googleMeetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 underline flex items-center gap-1 mb-4 break-all"
        >
          <Video size={14} className="flex-shrink-0" />
          <span className="truncate">{session.googleMeetLink}</span>
          <ExternalLink size={14} className="flex-shrink-0" />
        </a>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        {canComplete && (
          <button
            onClick={() => onMarkComplete(session)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <CheckCircle size={16} />
            Mark Complete
          </button>
        )}
        
        {session.status === 'completed' && (
          <button
            onClick={() => onCreateAssignment(session)}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <FileText size={16} />
            Create Assignment
          </button>
        )}
      </div>

      {/* Assignments */}
      {assignments.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs font-semibold text-purple-800 mb-2">📝 Assignments ({assignments.length})</p>
          <div className="space-y-2">
            {assignments.map(assignment => (
              <div key={assignment.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-700 truncate flex-1">{assignment.title}</span>
                <div className="flex items-center gap-2 ml-2">
                  {assignment.status === 'submitted' && (
                    <button
                      onClick={() => onGradeAssignment(assignment)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-semibold"
                    >
                      Grade
                    </button>
                  )}
                  {assignment.status === 'graded' && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      {assignment.score}/{assignment.maxScore}
                    </span>
                  )}
                  {assignment.status === 'pending' && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {session.tutorNotes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-700">{session.tutorNotes}</p>
        </div>
      )}

      {session.studentReview && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-800 mb-1">Student Feedback:</p>
          <p className="text-xs sm:text-sm text-blue-700">{session.studentReview}</p>
        </div>
      )}
    </div>
  );
}