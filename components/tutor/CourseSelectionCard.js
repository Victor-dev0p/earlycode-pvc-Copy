import { BookOpen, CheckCircle, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CourseSelectionCard({ course, isSelected, isFirstCourse, onSelect, disabled }) {
  const cost = isFirstCourse ? 'FREE' : '₦5,000';

  return (
    <div className={`bg-white rounded-xl border-2 transition-all ${
      isSelected 
        ? 'border-green-500 bg-green-50' 
        : disabled
        ? 'border-gray-200 opacity-50'
        : 'border-gray-200 hover:border-blue-500 hover:shadow-lg'
    }`}>
      {/* Course Image */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-blue-500 to-yellow-400 overflow-hidden rounded-t-xl">
        {course.photoUrl ? (
          <img 
            src={course.photoUrl} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="text-white" size={48} />
          </div>
        )}
        
        {isSelected && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={14} />
            Selected
          </div>
        )}

        {!isFirstCourse && !isSelected && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            ₦5,000
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 sm:line-clamp-3">
          {course.description}
        </p>

        {/* Course Meta */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs sm:text-sm">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            {course.durationMonths} months
          </span>
          <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200">
            {formatCurrency(course.price)}
          </span>
        </div>

        {/* Select Button */}
        <button
          onClick={() => onSelect(course)}
          disabled={disabled || isSelected}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all text-sm sm:text-base ${
            isSelected
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-yellow-400 hover:from-blue-600 hover:to-yellow-500 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              Selected
            </span>
          ) : disabled ? (
            <span className="flex items-center justify-center gap-2">
              <Lock size={18} />
              Unavailable
            </span>
          ) : (
            `Select Course ${!isFirstCourse ? '(₦5,000)' : '(Free)'}`
          )}
        </button>
      </div>
    </div>
  );
}