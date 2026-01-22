'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Plus, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import CurriculumViewer from '@/components/CurriculumViewer';

export default function MyCoursesClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');
      
      if (!email) {
        alert('Please log in first');
        router.push('/tutor/login');
        return;
      }

      console.log('📡 Fetching courses for:', email);
      
      // FIXED: Use tutorEmail parameter (matches the API route)
      const response = await fetch(`/api/tutor/courses/selected?tutorEmail=${encodeURIComponent(email)}`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      console.log('📦 Response text:', text.substring(0, 200));
      
      const data = JSON.parse(text);
      console.log('📦 Parsed data:', data);

      if (data.success) {
        // The API returns tutorCourses array, not selectedCourses
        const coursesData = data.tutorCourses || [];
        console.log('✅ Found courses:', coursesData.length);
        setCourses(coursesData);
      } else {
        setError(data.error || 'Failed to load courses');
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (course) => {
    if (course.paymentRequired && course.paymentStatus === 'pending') {
      return {
        color: 'yellow',
        icon: AlertCircle,
        label: 'Payment Pending',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
      };
    }

    switch (course.interviewStatus) {
      case 'pending':
        return {
          color: 'blue',
          icon: Clock,
          label: 'Awaiting Interview',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
        };
      case 'scheduled':
        return {
          color: 'purple',
          icon: Calendar,
          label: 'Interview Scheduled',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-700',
        };
      case 'completed':
        return {
          color: 'blue',
          icon: Clock,
          label: 'Interview Completed',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
        };
      case 'passed':
        return {
          color: 'green',
          icon: CheckCircle,
          label: 'Approved to Teach',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
        };
      case 'failed':
        return {
          color: 'red',
          icon: XCircle,
          label: 'Interview Failed',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
        };
      default:
        return {
          color: 'gray',
          icon: AlertCircle,
          label: 'Unknown Status',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
        };
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
              <p className="text-sm sm:text-base text-gray-600">Courses you've selected to teach</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/tutor/select-courses')}
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus size={20} />
            Add More Courses
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-600 font-medium">Error loading courses</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Courses List */}
        {courses.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {courses.map((course) => {
              const statusConfig = getStatusConfig(course);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <div className="bg-gradient-to-br from-blue-500 to-orange-500 p-3 rounded-xl flex-shrink-0">
                          <BookOpen className="text-white" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 break-words">
                            {course.courseName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Selected {formatDate(course.selectedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor} whitespace-nowrap`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Order</p>
                        <p className="font-semibold text-gray-800">
                          #{course.selectionOrder}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Payment</p>
                        <p className={`font-semibold text-xs sm:text-sm ${
                          course.paymentRequired 
                            ? course.paymentStatus === 'paid' 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                            : 'text-blue-600'
                        }`}>
                          {course.paymentRequired 
                            ? course.paymentStatus === 'paid' 
                              ? '✓ Paid' 
                              : '⚠ Pending'
                            : '✓ Free'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                        <p className="font-semibold text-gray-800">
                          {course.paymentRequired ? '₦5,000' : 'FREE'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Interview</p>
                        <p className={`font-semibold text-xs sm:text-sm ${
                          course.interviewStatus === 'passed' 
                            ? 'text-green-600' 
                            : course.interviewStatus === 'failed'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {course.interviewStatus === 'passed' ? '✓ Passed' :
                           course.interviewStatus === 'failed' ? '✗ Failed' :
                           course.interviewStatus === 'scheduled' ? '📅 Scheduled' :
                           '⏳ Pending'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {course.paymentRequired && course.paymentStatus === 'pending' && (
                        <button
                          onClick={() => alert('Payment integration coming soon!')}
                          className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          Complete Payment
                        </button>
                      )}

                      {(!course.paymentRequired || course.paymentStatus === 'paid') && 
                       course.interviewStatus === 'pending' && (
                        <button
                          onClick={() => router.push('/tutor/interview/schedule')}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          Schedule Interview
                        </button>
                      )}

                      {course.interviewStatus === 'passed' && (
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <p className="text-sm text-green-700 font-medium">
                            ✓ Ready to teach this course
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <CurriculumViewer 
                    courseId={course.courseId} 
                    userRole="tutor"
                    showProgress={true} // Shows which sessions have been taught
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Courses Selected</h3>
            <p className="text-gray-500 mb-6">
              You haven't selected any courses yet. Start by choosing courses you'd like to teach.
            </p>
            <button
              onClick={() => router.push('/tutor/select-courses')}
              className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Select Courses
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 sm:mt-8 bg-blue-50 border-2 border-blue-100 rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">📌 Next Steps</h3>
          <ol className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>1. Complete payment for additional courses (if any)</li>
            <li>2. Schedule interviews for each selected course</li>
            <li>3. Pass interviews to start teaching</li>
            <li>4. Get paired with students and begin sessions</li>
          </ol>
        </div>
      </div>
    </div>
  );
}