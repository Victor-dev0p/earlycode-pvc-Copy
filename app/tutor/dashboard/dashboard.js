'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock,
  AlertCircle,
  ArrowRight,
  Video
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TutorDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tutorData, setTutorData] = useState(null);
  const [interview, setInterview] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSessions: 0,
    completedSessions: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');

      const tutorResponse = await fetch(`/api/users/profile?email=${email}`);
      if (tutorResponse.ok) {
        const tutorData = await tutorResponse.json();
        if (tutorData.success) {
          setTutorData(tutorData.user);
        }
      }

      try {
        const interviewResponse = await fetch(`/api/tutor/interviews/my-interview?email=${email}`);
        const interviewData = await interviewResponse.json();

        if (interviewData.success && interviewData.hasInterview) {
          setInterview(interviewData.interview);
        }
      } catch (err) {
        console.log('No interview data yet');
      }

      try {
        const statsResponse = await fetch(`/api/tutor/dashboard/stats?tutorEmail=${email}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats({
              totalStudents: statsData.stats.currentStudents || 0,
              activeSessions: 0,
              completedSessions: 0,
            });
          }
        }
      } catch (err) {
        console.log('Stats not available yet');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');
      
      const response = await fetch('/api/tutor/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorEmail: email })
      });

      if (response.ok) {
        alert('✅ Onboarding completed! You are now active and ready for student pairings.');
        fetchDashboardData();
      } else {
        alert('Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      console.error('Onboarding complete error:', error);
      alert('Error completing onboarding');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const getInterviewStatusConfig = () => {
    if (!interview) {
      return {
        color: 'yellow',
        icon: AlertCircle,
        title: 'Book Your Interview',
        message: 'Schedule your tutor interview to start teaching',
        action: 'Book Interview',
        href: '/tutor/interview/schedule'
      };
    }

    switch (interview.status) {
      case 'pending':
        return {
          color: 'blue',
          icon: Clock,
          title: 'Interview Booked',
          message: `Your interview is scheduled for ${new Date(interview.interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
          action: 'View Details',
          href: '/tutor/interviews/status'
        };
      case 'scheduled':
        return {
          color: 'purple',
          icon: Video,
          title: 'Interview Ready',
          message: `Your interview is scheduled for ${new Date(interview.interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
          action: interview.googleMeetLink ? 'Join Interview' : 'View Details',
          href: interview.googleMeetLink || '/tutor/interviews/status',
          external: !!interview.googleMeetLink
        };
      case 'completed':
        return {
          color: 'blue',
          icon: Clock,
          title: 'Interview Completed',
          message: 'Your interview has been completed. Awaiting results.',
          action: 'View Status',
          href: '/tutor/interviews/status'
        };
      case 'passed':
        const isOnboarded = tutorData?.onboardingCompleted === true;
        const isActive = tutorData?.tutorStatus === 'active';
        
        if (isOnboarded || isActive) {
          return {
            color: 'green',
            icon: CheckCircle,
            title: 'You\'re All Set! 🎉',
            message: 'You\'re now an active tutor. Students will be paired with you soon.',
            action: 'View My Courses',
            href: '/tutor/my-courses',
            isOnboarded: true
          };
        } else {
          return {
            color: 'green',
            icon: CheckCircle,
            title: 'Congratulations! 🎉',
            message: 'You passed the interview! Complete onboarding to start teaching.',
            action: interview.onboardingLink ? 'Start Onboarding' : 'Mark as Onboarded',
            href: interview.onboardingLink,
            external: !!interview.onboardingLink,
            needsOnboarding: true
          };
        }
      case 'failed':
        return {
          color: 'red',
          icon: AlertCircle,
          title: 'Interview Not Passed',
          message: 'Unfortunately, you did not pass the interview. You can reapply after 3 months.',
          action: 'View Feedback',
          href: '/tutor/interviews/status'
        };
      default:
        return {
          color: 'gray',
          icon: AlertCircle,
          title: 'Interview Status Unknown',
          message: 'Please contact support for more information',
          action: 'View Details',
          href: '/tutor/interviews/status'
        };
    }
  };

  const interviewStatus = getInterviewStatusConfig();

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Welcome Back, Tutor!</h1>
        <p className="text-sm sm:text-base text-gray-600">Here's your teaching overview</p>
      </div>

      {/* Interview Status Banner */}
      <div className={`bg-gradient-to-r ${
        interviewStatus.color === 'yellow' ? 'from-yellow-400 to-orange-400' :
        interviewStatus.color === 'blue' ? 'from-blue-400 to-blue-600' :
        interviewStatus.color === 'purple' ? 'from-purple-400 to-purple-600' :
        interviewStatus.color === 'green' ? 'from-green-400 to-green-600' :
        interviewStatus.color === 'red' ? 'from-red-400 to-red-600' :
        'from-gray-400 to-gray-600'
      } rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8 text-white shadow-xl`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl flex-shrink-0">
              <interviewStatus.icon size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">{interviewStatus.title}</h2>
              <p className="text-sm sm:text-base text-white/90">{interviewStatus.message}</p>
            </div>
          </div>
          
          {/* Action Button */}
          {interviewStatus.needsOnboarding && !interviewStatus.href ? (
            <button
              onClick={handleOnboardingComplete}
              className="w-full sm:w-auto bg-white text-gray-800 hover:bg-gray-100 font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              {interviewStatus.action}
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => {
                if (interviewStatus.external && interviewStatus.href) {
                  window.open(interviewStatus.href, '_blank');
                } else if (interviewStatus.href) {
                  router.push(interviewStatus.href);
                }
              }}
              className="w-full sm:w-auto bg-white text-gray-800 hover:bg-gray-100 font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              {interviewStatus.action}
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <StatsCard
          icon={Users}
          label="My Students"
          value={stats.totalStudents}
          color="blue"
        />
        <StatsCard
          icon={BookOpen}
          label="Active Sessions"
          value={stats.activeSessions}
          color="orange"
        />
        <StatsCard
          icon={CheckCircle}
          label="Completed Sessions"
          value={stats.completedSessions}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 lg:p-8 shadow-sm mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/tutor/interviews/status')}
            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all group border-2 border-blue-100"
          >
            <div className="bg-blue-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
              <Calendar className="text-white" size={20} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Interview Status</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Check your interview details</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/tutor/students')}
            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-all group border-2 border-orange-100"
          >
            <div className="bg-orange-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
              <Users className="text-white" size={20} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">My Students</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">View your paired students</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/tutor/sessions')}
            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl hover:shadow-md transition-all group border-2 border-green-100"
          >
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
              <BookOpen className="text-white" size={20} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Sessions</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Manage teaching sessions</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/tutor/select-courses')}
            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl hover:shadow-md transition-all group border-2 border-yellow-100"
          >
            <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
              <BookOpen className="text-white" size={20} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Select Courses</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Choose courses to teach</p>
            </div>
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-blue-100">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">📚 Getting Started as a Tutor</h3>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Interview Process</h4>
            <ol className="text-xs sm:text-sm text-gray-600 space-y-2">
              <li>1. Book your interview slot (within 30 days)</li>
              <li>2. Wait for admin to send Google Meet link</li>
              <li>3. Attend the interview at scheduled time</li>
              <li>4. Receive results and onboarding info</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">After Passing</h4>
            <ol className="text-xs sm:text-sm text-gray-600 space-y-2">
              <li>1. Complete onboarding (Telegram group)</li>
              <li>2. Get paired with students</li>
              <li>3. Start teaching sessions</li>
              <li>4. Track progress and receive feedback</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}