import { BookOpen, Clock, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDuration } from '@/lib/utils';

export default function CourseCardPublic({ course, onEnroll, enrolling, isEnrolled }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* Course Image */}
      <div className="relative h-48 bg-blue-500 overflow-hidden flex-shrink-0">
        {course.photoUrl ? (
          <img 
            src={course.photoUrl} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="text-white" size={64} />
          </div>
        )}
        
        {isEnrolled && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={14} />
            Enrolled
          </div>
        )}

        {course.award && !isEnrolled && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Award size={14} />
            Certificate
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {course.description}
        </p>

        {/* Course Meta */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-blue-500 flex-shrink-0" />
            <span className="truncate">{formatDuration(course.durationMonths)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} className="text-yellow-500 flex-shrink-0" />
            <span className="truncate">{course.enrollmentCount || 0} students</span>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Sessions:</span>
            <span className="font-semibold text-gray-800">
              {course.frequencyDaysPerWeek}x/week • {course.sessionLengthHours}hrs
            </span>
          </div>
        </div>

        {/* Price & Enroll Button */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
              {formatCurrency(course.price)}
            </p>
          </div>
          
          <button
            onClick={() => onEnroll(course)}
            disabled={enrolling || isEnrolled}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm sm:text-base flex-shrink-0 ${
              isEnrolled
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : enrolling
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500  hover:from-blue-600 hover:to-yellow-500 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isEnrolled ? (
              <>
                <CheckCircle size={18} />
                <span className="hidden sm:inline">Enrolled</span>
              </>
            ) : (
              <>
                <span>Enroll</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}