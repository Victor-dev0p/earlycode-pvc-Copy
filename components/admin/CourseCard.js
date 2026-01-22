import { BookOpen, Users, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { formatCurrency, formatDuration, truncateText } from '@/lib/utils';

export default function CourseCard({ course, onEdit, onDelete, onView }) {
  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    published: 'bg-green-100 text-green-700 border-green-200',
    archived: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Course Image */}
      <div className="relative h-48 bg-blue-500 overflow-hidden">
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
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[course.status]}`}>
            {course.status}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {truncateText(course.description, 100)}
        </p>

        {/* Course Meta */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-blue-500" />
            <span>{formatDuration(course.durationMonths)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} className="text-orange-500" />
            <span>{course.enrollmentCount || 0} students</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-gray-800">
            {formatCurrency(course.price)}
          </span>
        </div>

        {/* Actions */}
       {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(course.id)}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Eye size={16} />
            View
          </button>
          <button
            onClick={() => onEdit(course.id)}
            className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(course.id)}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}