'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, BookOpen, CreditCard, X } from 'lucide-react';
import CourseCardPublic from '@/components/student/CourseCardPublic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function BrowseCoursesClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    if (!email) {
      alert('Please log in first');
      router.push('/student/login');
      return;
    }
    setUserEmail(email);
    fetchData(email);
  }, []);

  const fetchData = async (email) => {
    setLoading(true);
    setError('');

    try {
      console.log('📡 Fetching courses and enrollments...');
      
      // 🎯 FIX: Use admin endpoint to get all published courses
      const coursesResponse = await fetch('/api/admin/courses');
      
      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesResponse.status}`);
      }
      
      const coursesData = await coursesResponse.json();
      console.log('✅ Courses response:', coursesData);

      if (coursesData.success && Array.isArray(coursesData.courses)) {
        // Filter for published courses only
        const publishedCourses = coursesData.courses.filter(c => c.status === 'published');
        console.log(`✅ Found ${publishedCourses.length} published courses`);
        setCourses(publishedCourses);
      } else {
        console.warn('⚠️ No courses array in response');
        setCourses([]);
      }

      // Fetch student enrollments
      const enrollmentsResponse = await fetch(
        `/api/student/enrollments?email=${encodeURIComponent(email)}`
      );

      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        console.log('✅ Enrollments:', enrollmentsData);

        if (enrollmentsData.success) {
          const enrolledIds = (enrollmentsData.enrollments || []).map(e => e.courseId);
          setEnrolledCourseIds(enrolledIds);
          console.log(`✅ Student enrolled in ${enrolledIds.length} courses`);
        }
      } else {
        console.log('⚠️ No enrollments found (may be new student)');
      }

    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course) => {
    if (!course || !course.id) {
      alert('Invalid course');
      return;
    }
    
    console.log('💳 Selected course:', course.title);
    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    if (!selectedCourse || !userEmail) {
      alert('Missing payment information');
      return;
    }

    // Check if Flutterwave is loaded
    if (typeof window === 'undefined' || !window.FlutterwaveCheckout) {
      alert('Payment system not ready. Please refresh the page.');
      return;
    }

    const config = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: `ENROLL_${selectedCourse.id}_${Date.now()}`,
      amount: selectedCourse.price,
      currency: 'NGN',
      payment_options: 'card,mobilemoney,ussd',
      customer: {
        email: userEmail,
        name: userEmail.split('@')[0],
      },
      customizations: {
        title: 'PVC Course Enrollment',
        description: `Enrollment for ${selectedCourse.title}`,
        logo: 'https://your-logo-url.com/logo.png',
      },
      callback: async (response) => {
        console.log('💰 Payment response:', response);
        
        if (response.status === 'successful') {
          await completeEnrollment(selectedCourse, response.transaction_id);
        } else {
          alert('Payment failed. Please try again.');
          setEnrolling(false);
        }
      },
      onclose: () => {
        console.log('Payment closed');
        setEnrolling(false);
      },
    };

    console.log('🔧 Initializing payment with config:', config);
    setEnrolling(true);
    
    try {
      window.FlutterwaveCheckout(config);
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to start payment. Please try again.');
      setEnrolling(false);
    }
  };

  const completeEnrollment = async (course, paymentReference) => {
    try {
      console.log('📤 Completing enrollment:', {
        email: userEmail,
        courseId: course.id,
        paymentReference
      });

      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: userEmail,
          courseId: course.id,
          paymentReference,
          amountPaid: course.price,
        }),
      });

      const data = await response.json();
      console.log('📥 Enrollment response:', data);

      if (response.ok && data.success) {
        setEnrolledCourseIds([...enrolledCourseIds, course.id]);
        setShowPaymentModal(false);
        setSelectedCourse(null);

        alert('✅ Enrollment successful!\n\n⏳ We\'re finding you a qualified tutor.\nYou\'ll be notified when a tutor accepts.');
        
        // Optionally redirect to my-courses
        setTimeout(() => {
          router.push('/student/my-courses');
        }, 1000);
      } else {
        throw new Error(data.error || 'Enrollment failed');
      }
    } catch (error) {
      console.error('❌ Enrollment error:', error);
      alert(`❌ Enrollment failed: ${error.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Browse Courses</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Explore available courses and start learning today
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{courses.length}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Available</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {enrolledCourseIds.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Enrolled</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-2xl sm:text-3xl font-bold text-orange-600">
              {courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Students</p>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCourses.map((course) => (
              <CourseCardPublic
                key={course.id}
                course={course}
                onEnroll={handleEnrollClick}
                enrolling={enrolling}
                isEnrolled={enrolledCourseIds.includes(course.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {searchTerm ? 'No courses found' : 'No courses available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try different keywords' : 'Courses will appear here'}
            </p>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              {/* Header */}
              <div className="bg-blue-500 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Complete Payment</h3>
                    <p className="text-blue-50 text-sm">Secure Course Enrollment</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedCourse(null);
                    }}
                    disabled={enrolling}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Course</p>
                  <p className="font-bold text-gray-800">{selectedCourse.title}</p>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 mb-6 border-2 border-orange-200 text-center">
                  <p className="text-sm text-orange-700 mb-2">Amount</p>
                  <p className="text-5xl font-bold text-orange-600">
                    ₦{(selectedCourse.price || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Note:</strong> Payment secures your enrollment and we'll find you a qualified tutor.
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={enrolling}
                  className="w-full bg-blue-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pay Now
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  Secure payment by Flutterwave
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}