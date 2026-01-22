'use client';

import { Calendar, Users, Trash2 } from 'lucide-react';

export default function InterviewSlotCard({ slot, onDelete }) {
  if (!slot) return null;

  const isFullyBooked = slot.bookedCount >= slot.capacity;
  const availableSpots = slot.capacity - (slot.bookedCount || 0);
  const bookedPercentage = ((slot.bookedCount || 0) / slot.capacity) * 100;

  // Format date properly
  const formatSlotDate = () => {
    try {
      if (slot.dateDisplay) return slot.dateDisplay;
      if (slot.dateTimestamp) {
        return new Date(slot.dateTimestamp).toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      if (slot.date) {
        return new Date(slot.date).toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Invalid Date';
    } catch (e) {
      console.error('Date format error:', e);
      return 'Invalid Date';
    }
  };
  
  const getStatusColor = () => {
    if (isFullyBooked) return 'bg-red-100 text-red-700 border-red-200';
    if (slot.status === 'closed') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = () => {
    if (isFullyBooked) return 'FULLY BOOKED';
    if (slot.status === 'closed') return 'CLOSED';
    return 'OPEN';
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-full">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{formatSlotDate()}</h3>
            <p className="text-sm text-gray-500">Interview Slot</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Booking Status</span>
          <span className="text-sm font-bold text-gray-800">
            {slot.bookedCount || 0} / {slot.capacity}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${
              isFullyBooked ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(bookedPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-900">Total Capacity</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{slot.capacity}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-green-600" />
            <span className="text-xs font-semibold text-green-900">Available</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{availableSpots}</p>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => onDelete(slot.id)}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Trash2 size={16} />
        Delete Slot
      </button>

      {slot.createdAt && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Created {new Date(slot.createdAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}