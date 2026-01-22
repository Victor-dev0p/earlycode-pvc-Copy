'use client';

import { 
  Users, 
  Video, 
  Send, 
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function InterviewBookingCard({ 
  booking, 
  onAddMeetLink, 
  onSendMeetLink, 
  onUpdateStatus, 
  processing 
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'scheduled':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'passed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="bg-blue-500 p-2 sm:p-3 rounded-full flex-shrink-0">
            <Users className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">{booking.tutorName}</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{booking.tutorEmail}</p>
          </div>
        </div>
        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 self-start ${getStatusColor(booking.status)}`}>
          {booking.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 mb-1">Interview Date</p>
          <p className="font-semibold text-gray-800 text-sm truncate">{formatDate(booking.interviewDate)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 mb-1">Booked On</p>
          <p className="font-semibold text-gray-800 text-sm truncate">{formatDate(booking.bookedAt)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 mb-1">Meet Link</p>
          <p className={`font-semibold text-sm ${booking.googleMeetLink ? 'text-green-600' : 'text-red-600'}`}>
            {booking.googleMeetLink ? '✓ Added' : '✗ Not Set'}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 mb-1">Link Sent</p>
          <p className={`font-semibold text-sm ${booking.googleMeetSent ? 'text-green-600' : 'text-orange-600'}`}>
            {booking.googleMeetSent ? '✓ Sent' : '⚠ Pending'}
          </p>
        </div>
      </div>

      {booking.googleMeetLink && (
        <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-purple-800 mb-1">Google Meet Link</p>
          <a 
            href={booking.googleMeetLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 underline flex items-center gap-1 break-all"
          >
            <span className="truncate">{booking.googleMeetLink}</span>
            <ExternalLink size={14} className="flex-shrink-0" />
          </a>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!booking.googleMeetLink && (
          <button
            onClick={() => onAddMeetLink(booking)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm"
          >
            <Video size={16} className="flex-shrink-0" />
            <span>Add Meet Link</span>
          </button>
        )}

        {booking.googleMeetLink && !booking.googleMeetSent && (
          <button
            onClick={() => onSendMeetLink(booking.id)}
            disabled={processing}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
          >
            <Send size={16} className="flex-shrink-0" />
            <span>Send Link to Tutor</span>
          </button>
        )}

        {booking.status === 'scheduled' && (
          <button
            onClick={() => onUpdateStatus(booking, 'completed')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm"
          >
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>Mark Completed</span>
          </button>
        )}

        {(booking.status === 'completed' || booking.status === 'scheduled') && (
          <>
            <button
              onClick={() => onUpdateStatus(booking, 'passed')}
              className="bg-green-50 hover:bg-green-100 text-green-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm"
            >
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>Mark Passed</span>
            </button>
            <button
              onClick={() => onUpdateStatus(booking, 'failed')}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm"
            >
              <XCircle size={16} className="flex-shrink-0" />
              <span>Mark Failed</span>
            </button>
          </>
        )}

        {booking.status === 'passed' && !booking.onboardingSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm">
            <span className="text-green-700 font-medium">✓ Ready for onboarding</span>
          </div>
        )}

        {booking.onboardingSent && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm">
            <span className="text-blue-700 font-medium">✓ Onboarding sent</span>
          </div>
        )}
      </div>
    </div>
  );
}