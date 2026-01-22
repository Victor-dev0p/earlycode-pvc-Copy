'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, UserCheck, TrendingUp, Calendar } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminDashboardClient() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalTutors: 0,
    activeEnrollments: 0,
    pendingInterviews: 0,
    completedCourses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const coursesSnap = await getDocs(coursesRef);
      const courses = [];

      coursesSnap.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);

      let studentCount = 0;
      let tutorCount = 0;

      usersSnap.forEach((doc) => {
        const user = doc.data();
        if (user.role === 'student') studentCount++;
        if (user.role === 'tutor') tutorCount++;
      });

      const recentCoursesList = courses
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5);

      setStats({
        totalCourses: courses.length,
        totalStudents: studentCount,
        totalTutors: tutorCount,
        activeEnrollments: 0,
        pendingInterviews: 0,
        completedCourses: 0,
      });

      setRecentCourses(recentCoursesList);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    <div className="p-4 sm:p-6 lg:p-8 pt-24 lg:pt-8">

      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's what's happening with PVC today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatsCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} color="blue" />
        <StatsCard icon={Users} label="Total Students" value={stats.totalStudents} color="orange" trend={{ positive: true, value: '+8% this month' }} />
        <StatsCard icon={UserCheck} label="Total Tutors" value={stats.totalTutors} color="green" trend={{ positive: true, value: '+5% this month' }} />
        <StatsCard icon={TrendingUp} label="Active Enrollments" value={stats.activeEnrollments} color="purple" />
      </div>

      {/* Recent + Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

        {/* Recent Courses */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Courses</h2>
            <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap">View All →</button>
          </div>

          {recentCourses.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="bg-gradient-to-br from-blue-500 to-orange-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <BookOpen className="text-white" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{course.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{course.enrollmentCount || 0} students enrolled</p>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                    course.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">No courses yet</p>
              <button className="mt-3 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">Create Your First Course →</button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Quick Actions</h2>

          <div className="space-y-3">

            <a
              href="/admin/courses/create"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <BookOpen className="text-white" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Create New Course</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Add a new course to the platform</p>
              </div>
            </a>

            <a
              href="/admin/tutors"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="bg-green-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <UserCheck className="text-white" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Manage Tutors</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Review and approve tutors</p>
              </div>
            </a>

            <a
              href="/admin/interviews"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-purple-50 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="bg-purple-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Calendar className="text-white" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Schedule Interviews</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Manage tutor interviews</p>
              </div>
            </a>

            <a
              href="/admin/students"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="bg-orange-500 p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Users className="text-white" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">View Students</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Monitor student progress</p>
              </div>
            </a>

          </div>
        </div>

      </div>
    </div>
  );
}