'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  TrendingUp,
  ShoppingCart,
  Clock,
  ArrowRight,
  Star
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function StudentDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    completedSessions: 0,
    upcomingSessions: 0,
  });
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');

      try {
        const response = await fetch(`/api/student/enrollments?email=${email}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch enrollments');
        }
        
        const data = await response.json();

        if (data.success) {
          const enrollments = data.enrollments || [];
          setEnrollments(enrollments);
          
          const activeCount = enrollments.filter(e => 
            e.pairingStatus === 'accepted' || e.pairingStatus === 'active'
          ).length;
          
          setStats({
            totalCourses: enrollments.length,
            activeCourses: activeCount,
            completedSessions: 0,
            upcomingSessions: 0,
          });
        }
      } catch (err) {
        console.log('No enrollments yet');
        setEnrollments([]);
        setStats({
          totalCourses: 0,
          activeCourses: 0,
          completedSessions: 0,
          upcomingSessions: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setEnrollments([]);
      setStats({
        totalCourses: 0,
        activeCourses: 0,
        completedSessions: 0,
        upcomingSessions: 0,
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Welcome Back, Student!</h1>
          <p className="text-sm sm:text-base text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <StatsCard
            icon={BookOpen}
            label="Total Courses"
            value={stats.totalCourses}
            color="blue"
          />
          <StatsCard
            icon={GraduationCap}
            label="Active Courses"
            value={stats.activeCourses}
            color="yellow"
          />
          <StatsCard
            icon={Clock}
            label="Completed Sessions"
            value={stats.completedSessions}
            color="green"
          />
          <StatsCard
            icon={TrendingUp}
            label="Upcoming Sessions"
            value={stats.upcomingSessions}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-4 sm:p-6 lg:p-8 shadow-sm mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/student/courses')}
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all group border-2 border-blue-100"
            >
              <div className="bg-blue-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <BookOpen className="text-white" size={20} />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Browse Courses</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Explore available courses</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/student/my-courses')}
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl hover:shadow-md transition-all group border-2 border-yellow-100"
            >
              <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <ShoppingCart className="text-white" size={20} />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">My Courses</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">View enrolled courses</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/student/sessions')}
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl hover:shadow-md transition-all group border-2 border-green-100"
            >
              <div className="bg-green-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <GraduationCap className="text-white" size={20} />
              </div>
              <div className="text-left min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Sessions</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">View learning sessions</p>
              </div>
            </button>
          </div>
        </div>

        {/* Current Enrollments */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-4 sm:p-6 lg:p-8 shadow-sm mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">My Current Courses</h2>
            <button
              onClick={() => router.push('/student/my-courses')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 self-start sm:self-auto"
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {enrollments.slice(0, 3).map((enrollment) => {
                const isPaired = enrollment.pairingStatus === 'accepted' || enrollment.pairingStatus === 'active';
                
                return (
                  <div
                    key={enrollment.id}
                    className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                    onClick={() => router.push('/student/my-courses')}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 flex-1">
                        {enrollment.courseName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        isPaired
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {isPaired ? 'Active' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
                      <Clock size={14} className="flex-shrink-0" />
                      <span className="truncate">Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                    </div>

                    <div className="bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-yellow-400 h-full transition-all"
                        style={{ width: `${enrollment.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{enrollment.progressPercentage || 0}% Complete</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No Courses Yet</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Start your learning journey by enrolling in a course</p>
              <button
                onClick={() => router.push('/student/courses')}
                className="bg-gradient-to-r from-blue-500 to-yellow-400 hover:from-blue-600 hover:to-yellow-500 text-white font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg text-sm sm:text-base"
              >
                Browse Courses
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Learning Tips */}
        <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-xl sm:rounded-2xl border-2 border-blue-100 p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="text-yellow-500 flex-shrink-0" size={24} />
            Learning Tips
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Stay Consistent</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Attend your sessions regularly and complete assignments on time to maximize your learning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Communicate with Your Tutor</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Don't hesitate to ask questions. Your tutor is here to help you succeed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}