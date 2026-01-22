'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import CourseSelectionCard from '@/components/tutor/CourseSelectionCard';
import PaymentModal from '@/components/tutor/PaymentModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SelectCoursesClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebug = (message) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    if (!email) {
      alert('Please log in first');
      router.push('/tutor/login');
      return;
    }
    setUserEmail(email);
    fetchData(email);
  }, [router]);

  const fetchData = async (email) => {
    setLoading(true);
    setError('');
    setDebugInfo([]);
    
    try {
      addDebug(`🚀 Starting fetch for email: ${email}`);

      // Fetch all courses
      addDebug('📡 Fetching courses from /api/admin/courses');
      const coursesResponse = await fetch('/api/admin/courses');
      
      addDebug(`📡 Response status: ${coursesResponse.status}`);
      addDebug(`📡 Response ok: ${coursesResponse.ok}`);
      addDebug(`📡 Response headers: ${JSON.stringify(Object.fromEntries(coursesResponse.headers.entries()))}`);
      
      if (!coursesResponse.ok) {
        throw new Error(`HTTP ${coursesResponse.status}: ${coursesResponse.statusText}`);
      }
      
      const coursesText = await coursesResponse.text();
      addDebug(`📦 Response length: ${coursesText.length} characters`);
      addDebug(`📦 First 200 chars: ${coursesText.substring(0, 200)}`);
      
      let coursesData;
      try {
        coursesData = JSON.parse(coursesText);
        addDebug(`✅ JSON parsed successfully`);
        addDebug(`📦 Data structure: ${JSON.stringify(Object.keys(coursesData))}`);
      } catch (parseError) {
        addDebug(`❌ JSON parse failed: ${parseError.message}`);
        throw new Error(`Invalid JSON response from /api/admin/courses`);
      }

      if (coursesData.success) {
        addDebug(`✅ API returned success: true`);
        addDebug(`📚 Total courses: ${coursesData.courses?.length || 0}`);
        
        if (Array.isArray(coursesData.courses)) {
          const allCourses = coursesData.courses;
          addDebug(`📚 Courses array: ${allCourses.map(c => c.title).join(', ')}`);
          
          const publishedCourses = allCourses.filter(c => c.status === 'published');
          addDebug(`✅ Published courses: ${publishedCourses.length}`);
          addDebug(`📚 Published titles: ${publishedCourses.map(c => c.title).join(', ')}`);
          
          setCourses(publishedCourses);
        } else {
          addDebug(`❌ courses is not an array: ${typeof coursesData.courses}`);
          setCourses([]);
        }
      } else {
        addDebug(`❌ API returned success: false`);
        addDebug(`❌ Error: ${coursesData.error || 'Unknown error'}`);
        setCourses([]);
      }

      // Fetch selected courses
      addDebug('📡 Fetching selected courses');
      const selectedUrl = `/api/tutor/courses/selected?tutorEmail=${encodeURIComponent(email)}`;
      addDebug(`📡 URL: ${selectedUrl}`);
      
      const selectedResponse = await fetch(selectedUrl);
      addDebug(`📡 Selected response status: ${selectedResponse.status}`);
      
      if (selectedResponse.ok) {
        const selectedText = await selectedResponse.text();
        const selectedData = JSON.parse(selectedText);
        addDebug(`✅ Selected data: ${JSON.stringify(selectedData)}`);
        
        if (selectedData.success && Array.isArray(selectedData.selectedCourseIds)) {
          setSelectedCourseIds(selectedData.selectedCourseIds);
          addDebug(`✅ Set ${selectedData.selectedCourseIds.length} selected courses`);
        } else {
          setSelectedCourseIds([]);
          addDebug(`⚠️ No selected courses array`);
        }
      } else {
        addDebug('⚠️ No selected courses (OK for new tutors)');
        setSelectedCourseIds([]);
      }

      addDebug('✅ Fetch complete!');

    } catch (error) {
      addDebug(`❌ FATAL ERROR: ${error.message}`);
      setError(error.message);
      setCourses([]);
      setSelectedCourseIds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    if (processing) return;
    
    const isFirstCourse = selectedCourseIds.length === 0;
    addDebug(`🎯 Selecting: ${course.title} (first=${isFirstCourse})`);

    if (isFirstCourse) {
      await selectCourse(course);
    } else {
      setSelectedCourse(course);
      setShowPaymentModal(true);
    }
  };

  const selectCourse = async (course) => {
    setProcessing(true);
    setError('');

    try {
      addDebug(`📤 POST to /api/tutor/courses/selected`);
      addDebug(`📤 Body: ${JSON.stringify({ tutorEmail: userEmail, courseId: course.id })}`);

      const response = await fetch('/api/tutor/courses/selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorEmail: userEmail,
          courseId: course.id,
        }),
      });

      addDebug(`📥 Response status: ${response.status}`);

      const responseText = await response.text();
      addDebug(`📥 Response (first 300 chars): ${responseText.substring(0, 300)}`);

      let data;
      try {
        data = JSON.parse(responseText);
        addDebug(`✅ Parsed: ${JSON.stringify(data)}`);
      } catch (e) {
        addDebug(`❌ JSON parse error: ${e.message}`);
        throw new Error('Server returned non-JSON response. Check API route exists at /api/tutor/courses/selected/route.js');
      }

      if (response.ok && data.success) {
        setSelectedCourseIds(prev => [...prev, course.id]);
        alert(data.message || 'Course selected!');
        setShowPaymentModal(false);
        setSelectedCourse(null);
        addDebug(`✅ Course selected successfully`);
      } else {
        throw new Error(data.error || 'Selection failed');
      }
    } catch (error) {
      addDebug(`❌ Error: ${error.message}`);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentComplete = async (paymentReference) => {
    if (!selectedCourse || !paymentReference) {
      alert('Invalid payment data');
      return;
    }

    setProcessing(true);

    try {
      const selectResponse = await fetch('/api/tutor/courses/selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorEmail: userEmail,
          courseId: selectedCourse.id,
        }),
      });

      const selectData = await selectResponse.json();

      if (!selectResponse.ok || !selectData.success) {
        throw new Error(selectData.error || 'Failed to select course');
      }

      const verifyResponse = await fetch('/api/tutor/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorCourseId: selectData.tutorCourseId,
          paymentReference,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.success) {
        setSelectedCourseIds(prev => [...prev, selectedCourse.id]);
        setShowPaymentModal(false);
        setSelectedCourse(null);
        alert('✅ Payment successful!');
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors self-start flex-shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Select Courses to Teach
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Choose courses you're qualified to teach. First course is free, additional courses cost ₦5,000 each.
            </p>
          </div>
        </div>

        {/* DEBUG INFO - REMOVE THIS AFTER FIXING */}
        {debugInfo.length > 0 && (
          <div className="mb-6 p-4 bg-gray-900 text-green-400 rounded-xl overflow-auto max-h-96 text-xs font-mono">
            <div className="flex justify-between items-center mb-2">
              <strong className="text-white">🐛 Debug Log:</strong>
              <button 
                onClick={() => setDebugInfo([])}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Clear
              </button>
            </div>
            {debugInfo.map((info, i) => (
              <div key={i}>{info}</div>
            ))}
          </div>
        )}

        {/* Selection Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Your Progress</h2>
              <p className="text-blue-50 text-sm sm:text-base">
                You've selected <strong>{selectedCourseIds.length}</strong> course{selectedCourseIds.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => router.push('/tutor/my-courses')}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <CheckCircle size={20} />
              View My Courses
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-600 font-medium mb-1">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">📚 Important Information</h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Your <strong>first course selection is FREE</strong></li>
            <li>• Additional courses cost <strong>₦5,000 each</strong></li>
            <li>• You must pass an interview for each selected course</li>
            <li>• Interviews are scheduled separately per course</li>
          </ul>
        </div>

        {/* Status Info */}
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            <strong>Status:</strong> Found {courses.length} published course{courses.length !== 1 ? 's' : ''} 
            {filteredCourses.length !== courses.length && ` (${filteredCourses.length} matching search)`}
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCourses.map((course) => (
              <CourseSelectionCard
                key={course.id}
                course={course}
                isSelected={selectedCourseIds.includes(course.id)}
                isFirstCourse={selectedCourseIds.length === 0}
                onSelect={handleSelectCourse}
                disabled={processing}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No courses match your search' : 'No published courses available'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Check the debug log above to see what went wrong'}
            </p>
            <button
              onClick={() => fetchData(userEmail)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry Fetch
            </button>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedCourse && (
          <PaymentModal
            course={selectedCourse}
            amount={5000}
            tutorEmail={userEmail}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedCourse(null);
            }}
            onPaymentComplete={handlePaymentComplete}
          />
        )}

        {/* Processing Overlay */}
        {processing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full">
              <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
              <p className="text-gray-700 font-semibold">Processing...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}