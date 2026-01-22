import { BookOpen, Clock, User, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { formatDate } from '@/lib/timeUtils';

export default function EnrollmentCard({ enrollment, onViewDetails }) {
  const getStatusConfig = () => {
    switch (enrollment.status) {
      case 'pending_pairing':
        return {
          icon: AlertCircle,
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          label: 'Finding Tutor...'
        };
      case 'active':
        return {
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          label: 'Active'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          label: 'Completed'
        };
      case 'dropped':
        return {
          icon: AlertCircle,
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          label: 'Dropped'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="bg-blue-500 p-3 rounded-xl flex-shrink-0">
              <BookOpen className="text-white" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 break-words">
                {enrollment.courseName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Enrolled {formatDate(enrollment.enrolledAt)}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor} whitespace-nowrap self-start sm:self-auto`}>
            <StatusIcon size={14} />
            {statusConfig.label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600">Progress</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">
              {enrollment.progressPercentage || 0}%
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-500  h-full transition-all duration-500"
              style={{ width: `${enrollment.progressPercentage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Tutor Info */}
        {enrollment.tutorId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <User size={16} />
              <span className="font-medium">Your Tutor Assigned</span>
            </div>
          </div>
        )}

        {enrollment.status === 'pending_pairing' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-yellow-800">
              <Users size={16} />
              <span>We're finding you the perfect tutor...</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onViewDetails(enrollment)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
        >
          View Details
        </button>
      </div>
    </div>
  );
}