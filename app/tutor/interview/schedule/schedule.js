'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import InterviewBookingCalendar from '@/components/tutor/InterviewBookingCalendar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ScheduleInterviewClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [slots, setSlots] = useState([]);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebug = (msg) => {
    console.log(msg);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError('');
    
    try {
      const email = sessionStorage.getItem('userEmail');
      
      if (!email) {
        alert('Please log in first');
        router.push('/tutor/login');
        return;
      }

      addDebug(`📡 Fetching slots for: ${email}`);

      // FIXED: Use tutorEmail parameter
      const url = `/api/tutor/interviews/available-slots?tutorEmail=${encodeURIComponent(email)}`;
      addDebug(`📡 URL: ${url}`);
      
      const response = await fetch(url);
      addDebug(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      addDebug(`📦 Response length: ${text.length} chars`);
      
      const data = JSON.parse(text);
      addDebug(`📦 Parsed data: ${JSON.stringify(Object.keys(data))}`);

      if (data.alreadyBooked) {
        addDebug('⚠️ Already booked an interview');
        setAlreadyBooked(true);
      } else if (data.success) {
        addDebug(`✅ Found ${data.slots?.length || 0} slots`);
        setSlots(data.slots || []);
        
        if (data.slots && data.slots.length > 0) {
          addDebug(`📅 First slot: ${JSON.stringify(data.slots[0])}`);
        }
      } else {
        addDebug(`❌ Error: ${data.error}`);
        setError(data.error || 'Failed to load slots');
      }
    } catch (error) {
      addDebug(`❌ Fetch error: ${error.message}`);
      setError(`Failed to load slots: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

 // Add this to the handleBookSlot function in app/tutor/interview/schedule/schedule.js

  // REPLACE the entire handleBookSlot function with this:

  const handleBookSlot = async (slot) => {
    setBooking(true);
    setError('');

    try {
      const email = sessionStorage.getItem('userEmail');
      
      addDebug(`📤 Booking slot: ${slot.id}`);
      addDebug(`📅 Date: ${slot.date}`);

      const response = await fetch('/api/tutor/interviews/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorEmail: email,
          tutorName: email.split('@')[0],
          slotId: slot.id,
          interviewDate: slot.date,
        }),
      });

      addDebug(`📥 Book response: ${response.status}`);

      const data = await response.json();
      addDebug(`📦 Book data: ${JSON.stringify(data)}`);

      // 🎯 CHECK FOR NO_COURSES_SELECTED ERROR
      if (!response.ok && data.code === 'NO_COURSES_SELECTED') {
        addDebug('❌ No courses selected - redirecting');
        
        // Show error message with redirect option
        const shouldRedirect = confirm(
          'You must select at least one course before booking an interview.\n\n' +
          'Would you like to select courses now?'
        );
        
        if (shouldRedirect) {
          router.push('/tutor/select-courses');
        }
        
        setError('Please select at least one course before booking an interview');
        return;
      }

      if (response.ok && data.success) {
        addDebug('✅ Booking successful!');
        setSuccess(true);
        setTimeout(() => {
          router.push('/tutor/interviews/status');
        }, 2000);
      } else {
        const errorMsg = data.error || 'Failed to book interview';
        addDebug(`❌ Booking failed: ${errorMsg}`);
        setError(errorMsg);
      }
    } catch (error) {
      addDebug(`❌ Booking error: ${error.message}`);
      setError(`Network error: ${error.message}`);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border-2 border-green-200 p-12 max-w-md w-full text-center shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 p-6 rounded-full animate-bounce">
              <CheckCircle className="text-green-600" size={64} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Interview Booked! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Your interview has been successfully scheduled. You'll receive a Google Meet link from the admin before your interview date.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin text-blue-500" size={16} />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyBooked) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Schedule Interview</h1>
              <p className="text-gray-600">Book your tutor interview slot</p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 sm:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-blue-100 p-6 rounded-full">
                <CheckCircle className="text-blue-600" size={64} />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Interview Already Booked</h2>
            <p className="text-gray-600 mb-6">
              You have already booked an interview slot. View your interview details on the status page.
            </p>
            <button
              onClick={() => router.push('/tutor/interviews/status')}
              className="bg-blue-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
            >
              View Interview Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Schedule Interview</h1>
            <p className="text-gray-600">Choose a date within the next 30 days</p>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div className="mb-6 p-4 bg-gray-900 text-green-400 rounded-xl overflow-auto max-h-64 text-xs font-mono">
            <div className="flex justify-between items-center mb-2">
              <strong className="text-white">🐛 Debug Log:</strong>
              <button 
                onClick={() => setDebugInfo([])}
                className="text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            </div>
            {debugInfo.map((info, i) => (
              <div key={i}>{info}</div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-600 font-medium">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Slots Status */}
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            <strong>Available Slots:</strong> {slots.length} found
            {slots.length === 0 && ' - Admin needs to create interview slots first'}
          </p>
        </div>

        {/* Calendar */}
        {slots.length > 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 sm:p-8 shadow-sm">
            <InterviewBookingCalendar 
              slots={slots} 
              onBook={handleBookSlot}
              loading={booking}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Slots Available</h3>
            <p className="text-gray-600 mb-4">
              There are currently no interview slots available. Please check back later or contact admin.
            </p>
            <button
              onClick={fetchAvailableSlots}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-100 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">📌 Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You can only book ONE interview slot</li>
            <li>• Interview slots are available within 30 days from today</li>
            <li>• Admin will send you a Google Meet link before your interview</li>
            <li>• Make sure you're available on the date you choose</li>
            <li>• Interview results are typically shared within a week</li>
          </ul>
        </div>
      </div>
    </div>
  );
}