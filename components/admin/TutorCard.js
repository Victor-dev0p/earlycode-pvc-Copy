import { User, Mail, Phone, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function TutorCard({ tutor, onViewDetails }) {
  const statusConfig = {
    pending_interview: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: Clock,
      label: 'Pending Interview'
    },
    interview_scheduled: {
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Calendar,
      label: 'Interview Scheduled'
    },
    passed: {
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
      label: 'Passed'
    },
    failed: {
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
      label: 'Failed'
    },
    active: {
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
      label: 'Active'
    }
  };

  const status = statusConfig[tutor.tutorStatus] || statusConfig.pending_interview;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="bg-gradient-to-br from-blue-500 to-orange-500 p-2 sm:p-3 rounded-full flex-shrink-0">
            <User className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-sm sm:text-lg truncate">
              {tutor.email.split('@')[0]}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{tutor.state}, {tutor.lga}</p>
          </div>
        </div>
        
        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${status.color}`}>
          <StatusIcon size={12} className="flex-shrink-0" />
          <span className="hidden sm:inline">{status.label}</span>
          <span className="sm:hidden">{status.label.split(' ')[0]}</span>
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
          <Mail size={14} className="text-blue-500 flex-shrink-0" />
          <span className="truncate">{tutor.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <Phone size={14} className="text-orange-500 flex-shrink-0" />
          <span>{tutor.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <Calendar size={14} className="text-purple-500 flex-shrink-0" />
          <span>Joined {formatDate(tutor.createdAt)}</span>
        </div>
      </div>

      {/* Interview Status */}
      {tutor.interviewBooked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-4">
          <p className="text-xs font-semibold text-blue-800 mb-1">Interview Status</p>
          <p className="text-xs sm:text-sm text-blue-700">
            {tutor.tutorStatus === 'interview_scheduled' 
              ? 'Interview scheduled - awaiting completion' 
              : 'Interview booking confirmed'}
          </p>
        </div>
      )}

      {/* Actions */}
      <button
        onClick={() => onViewDetails(tutor)}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
      >
        View Details
      </button>
    </div>
  );
}