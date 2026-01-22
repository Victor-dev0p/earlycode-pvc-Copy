'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Plus, Users, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CurriculumViewer from '@/components/CurriculumViewer';

export default function MyCoursesClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseProgress, setCourseProgress] = useState({}); // Store progress per course

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');
      console.log('📡 Fetching enrollments for:', email);
      
      const response = await fetch(`/api/student/enrollments?email=${email}`);
      const data = await response.json();

      console.log('✅ Enrollments response:', data);

      if (data.success) {
        setEnrollments(data.enrollments);
        
        // Calculate progress for each course
        await calculateProgressForCourses(data.enrollments, email);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgressForCourses = async (enrollments, email) => {
    try {
      // Get user profile to get ID
      const profileRes = await fetch(`/api/users/profile?email=${encodeURIComponent(email)}`);
      const profileData = await profileRes.json();
      
      if (!profileData.success) {
        console.error('Failed to get profile');
        return;
      }

      const studentId = profileData.user.id;
      console.log('👤 Student ID:', studentId);

      // Get all sessions for this student
      const sessionsRes = await fetch(`/api/sessions?studentId=${studentId}`);
      const sessionsData = await sessionsRes.json();
      
      if (!sessionsData.success) {
        console.error('Failed to get sessions');
        return;
      }

      console.log('📚 All sessions:', sessionsData.sessions);

      // Calculate progress for each course
      const progressMap = {};
      
      for (const enrollment of enrollments) {
        const courseId = enrollment.courseId;
        
        // Get curriculum for this course
        const currRes = await fetch(`/api/admin/courses/${courseId}/curriculum`);
        const currData = await currRes.json();
        
        if (!currData.success || !currData.curriculum) {
          console.warn(`No curriculum for course ${courseId}`);
          progressMap[courseId] = 0;
          continue;
        }

        // Count total sessions in curriculum
        const totalSessions = currData.curriculum.reduce((sum, module) => {
          return sum + (module.sessions?.length || 0);
        }, 0);

        if (totalSessions === 0) {
          progressMap[courseId] = 0;
          continue;
        }

        // Get curriculum session IDs
        const curriculumSessionIds = new Set();
        currData.curriculum.forEach(module => {
          module.sessions?.forEach(session => {
            curriculumSessionIds.add(session.id);
          });
        });

        // Count completed sessions that match curriculum
        const completedSessions = sessionsData.sessions.filter(s => 
          s.courseId === courseId && 
          s.status === 'completed' &&
          s.sessionId && 
          curriculumSessionIds.has(s.sessionId)
        );

        const progress = Math.round((completedSessions.length / totalSessions) * 100);
        
        console.log(`📊 Progress for ${courseId}:`, {
          totalSessions,
          completedSessions: completedSessions.length,
          progress: progress + '%'
        });

        progressMap[courseId] = progress;
      }

      setCourseProgress(progressMap);
      console.log('✅ Progress calculated:', progressMap);
      
    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  };

  const getStatusBadge = (enrollment) => {
    if (enrollment.pairingStatus === 'accepted' || enrollment.pairingStatus === 'active') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle size={14} />
          Paired
        </span>
      );
    } else if (enrollment.pairingStatus === 'pending') {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <Clock size={14} />
          Finding Tutor
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
        Unknown
      </span>
    );
  };

  const toggleCurriculum = (enrollmentId) => {
    setExpandedCourse(expandedCourse === enrollmentId ? null : enrollmentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const activeCount = enrollments.filter(e => 
    e.pairingStatus === 'accepted' || e.pairingStatus === 'active'
  ).length;
  
  const pendingCount = enrollments.filter(e => 
    e.pairingStatus === 'pending'
  ).length;

  // Calculate total progress across all courses
  const totalProgress = enrollments.length > 0
    ? Math.round(
        enrollments.reduce((sum, e) => sum + (courseProgress[e.courseId] || 0), 0) / enrollments.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">My Courses</h1>
              <p className="text-sm sm:text-base text-gray-600">Track your learning progress</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/student/courses')}
            className="bg-gradient-to-r from-blue-500 to-yellow-400 hover:from-blue-600 hover:to-yellow-500 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Browse More Courses
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{enrollments.length}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Enrolled</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Active</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">{totalProgress}%</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Avg Progress</p>
          </div>
        </div>

        {/* Enrollments List */}
        {enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const isPaired = enrollment.pairingStatus === 'accepted' || enrollment.pairingStatus === 'active';
              const isCurriculumExpanded = expandedCourse === enrollment.id;
              const progress = courseProgress[enrollment.courseId] || 0;
              
              return (
                <div key={enrollment.id} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl flex-shrink-0">
                          <BookOpen className="text-white" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">{enrollment.courseName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(enrollment)}
                    </div>

                    {/* Progress Bar - REAL DATA! */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Course Progress</span>
                        <span className="font-semibold text-gray-800">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on completed curriculum sessions
                      </p>
                    </div>

                    {/* Tutor Info */}
                    {isPaired && enrollment.tutorName ? (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-500 p-2 rounded-full flex-shrink-0">
                            <Users className="text-white" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-900">Your Tutor</p>
                            <p className="text-sm text-green-700 break-words">{enrollment.tutorName}</p>
                            {enrollment.tutorEmail && (
                              <p className="text-xs text-green-600 break-all">{enrollment.tutorEmail}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : enrollment.pairingStatus === 'pending' ? (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 sm:p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Clock className="text-yellow-600 flex-shrink-0" size={20} />
                          <p className="text-sm text-yellow-800">
                            We're finding you the perfect tutor...
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button 
                        onClick={() => toggleCurriculum(enrollment.id)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <BookOpen size={18} />
                        {isCurriculumExpanded ? (
                          <>
                            <span>Hide Curriculum</span>
                            <ChevronUp size={18} />
                          </>
                        ) : (
                          <>
                            <span>View Curriculum</span>
                            <ChevronDown size={18} />
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => router.push('/student/sessions')}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2.5 sm:py-3 rounded-lg transition-colors"
                      >
                        Go to Sessions
                      </button>
                    </div>
                  </div>

                  {/* Curriculum Viewer (Expandable) */}
                  {isCurriculumExpanded && (
                    <div className="border-t-2 border-gray-100 p-4 sm:p-6 bg-gray-50">
                      <CurriculumViewer 
                        courseId={enrollment.courseId}
                        userRole="student"
                        showProgress={true}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Enrollments Yet</h3>
            <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course</p>
            <button
              onClick={() => router.push('/student/courses')}
              className="bg-gradient-to-r from-blue-500 to-yellow-400 hover:from-blue-600 hover:to-yellow-500 text-white font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}