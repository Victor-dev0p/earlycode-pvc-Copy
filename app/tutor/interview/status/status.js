'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Mail
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function InterviewStatusClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    fetchInterviewStatus();
  }, []);

  const fetchInterviewStatus = async () => {
    try {
      const email = sessionStorage.getItem('userEmail');
      const response = await fetch(`/api/tutor/interviews/my-interview?email=${email}`);
      const data = await response.json();

      if (data.success && data.hasInterview) {
        setInterview(data.interview);
      }
    } catch (error) {
      console.error('Error fetching interview status:', error);
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

  if (!interview) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Interview Status</h1>
            <p className="text-gray-600">Your interview information</p>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="bg-yellow-100 p-6 rounded-full">
              <AlertCircle className="text-yellow-600" size={64} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Interview Booked</h2>
          <p className="text-gray-600 mb-8">
            You haven't booked an interview slot yet. Schedule your interview to start your journey as a PVC tutor.
          </p>
          <button
            onClick={() => router.push('/tutor/interview/schedule')}
            className="bg-blue-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg"
          >
            Schedule Interview Now
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (interview.status) {
      case 'pending':
        return {
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Clock,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          title: 'Interview Booked',
          message: 'Your interview is scheduled. The admin will send you a Google Meet link soon.',
          showMeetLink: false,
          showOnboarding: false
        };
      case 'scheduled':
        return {
          color: 'purple',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: Video,
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          title: 'Interview Ready',
          message: 'Your Google Meet link has been sent. Join the interview at the scheduled time.',
          showMeetLink: true,
          showOnboarding: false
        };
      case 'completed':
        return {
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: CheckCircle,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          title: 'Interview Completed',
          message: 'Your interview has been completed. Awaiting results from the admin.',
          showMeetLink: false,
          showOnboarding: false
        };
      case 'passed':
        return {
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          title: 'Congratulations! You Passed! ',
          message: 'You have successfully passed the interview. Complete your onboarding to start teaching.',
          showMeetLink: false,
          showOnboarding: true
        };
      case 'failed':
        return {
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: XCircle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          title: 'Interview Not Passed',
          message: 'Unfortunately, you did not pass the interview. You can reapply after 3 months.',
          showMeetLink: false,
          showOnboarding: false
        };
      default:
        return {
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: AlertCircle,
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          title: 'Status Unknown',
          message: 'Please contact support for more information about your interview.',
          showMeetLink: false,
          showOnboarding: false
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Interview Status</h1>
          <p className="text-gray-600">Track your interview progress</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`${statusConfig.bgColor} border-2 ${statusConfig.borderColor} rounded-2xl p-8 mb-8`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`${statusConfig.iconBg} p-4 rounded-xl`}>
            <StatusIcon className={statusConfig.iconColor} size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{statusConfig.title}</h2>
            <p className="text-gray-600 mt-2">{statusConfig.message}</p>
          </div>
        </div>

        {/* Google Meet Link */}
        {statusConfig.showMeetLink && interview.googleMeetLink && (
          <div className="mt-6">
            <a
              href={interview.googleMeetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-blue-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Video size={24} />
              Join Interview via Google Meet
              <ExternalLink size={20} />
            </a>
          </div>
        )}

        {/* Onboarding Link */}
        {statusConfig.showOnboarding && interview.onboardingLink && (
          <div className="mt-6">
            <a
              href={interview.onboardingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <CheckCircle size={24} />
              Complete Onboarding
              <ExternalLink size={20} />
            </a>
          </div>
        )}
      </div>

      {/* Interview Details */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Interview Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Interview Date */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="text-blue-500" size={24} />
              <h4 className="font-semibold text-gray-700">Interview Date</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {formatDate(interview.interviewDate)}
            </p>
          </div>

          {/* Booking Time */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-orange-500" size={24} />
              <h4 className="font-semibold text-gray-700">Booked On</h4>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {formatTime(interview.bookedAt)}
            </p>
          </div>

          {/* Status */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="text-purple-500" size={24} />
              <h4 className="font-semibold text-gray-700">Current Status</h4>
            </div>
            <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
              interview.status === 'pending' ? 'bg-blue-100 text-blue-700' :
              interview.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
              interview.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              interview.status === 'passed' ? 'bg-green-100 text-green-700' :
              interview.status === 'failed' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {interview.status.toUpperCase()}
            </span>
          </div>

          {/* Google Meet Status */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="text-green-500" size={24} />
              <h4 className="font-semibold text-gray-700">Google Meet Link</h4>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {interview.googleMeetSent ? (
                <span className="text-green-600 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Sent
                </span>
              ) : (
                <span className="text-orange-600 flex items-center gap-2">
                  <Clock size={20} />
                  Pending
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Interview Notes (if any) */}
      {interview.interviewNotes && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Interview Feedback</h3>
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap">{interview.interviewNotes}</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Interview Timeline</h3>
        <div className="space-y-4">
          {/* Booked */}
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-2 rounded-full mt-1">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Interview Booked</h4>
              <p className="text-sm text-gray-500">{formatTime(interview.bookedAt)}</p>
            </div>
          </div>

          {/* Google Meet Sent */}
          {interview.googleMeetSent && (
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-full mt-1">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Google Meet Link Sent</h4>
                <p className="text-sm text-gray-500">{formatTime(interview.googleMeetSentAt)}</p>
              </div>
            </div>
          )}

          {/* Status Updates */}
          {interview.status === 'completed' && (
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full mt-1">
                <Clock className="text-blue-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Interview Completed</h4>
                <p className="text-sm text-gray-500">Awaiting results</p>
              </div>
            </div>
          )}

          {interview.status === 'passed' && (
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-full mt-1">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Interview Passed ✓</h4>
                <p className="text-sm text-gray-500">{formatTime(interview.updatedAt)}</p>
              </div>
            </div>
          )}

          {interview.status === 'failed' && (
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-2 rounded-full mt-1">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Interview Not Passed</h4>
                <p className="text-sm text-gray-500">{formatTime(interview.updatedAt)}</p>
              </div>
            </div>
          )}

          {/* Onboarding Sent */}
          {interview.onboardingSent && (
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-full mt-1">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Onboarding Link Sent</h4>
                <p className="text-sm text-gray-500">{formatTime(interview.onboardingSentAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border-2 border-blue-100 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">❓ Need Help?</h3>
        <p className="text-sm text-blue-800">
          If you have any questions about your interview or need to reschedule, please contact our support team at{' '}
          <a href="mailto:support@pvc.com" className="underline font-semibold">support@pvc.com</a>
        </p>
      </div>
    </div>
  );
}