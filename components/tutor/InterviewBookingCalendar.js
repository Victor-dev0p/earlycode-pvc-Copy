'use client';

import { Calendar, Clock, Users, Check } from 'lucide-react';

export default function InterviewBookingCalendar({ slots, onBook, loading }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return today.toDateString() === date.toDateString();
  };

  const isSoon = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (slots.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
        <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Available Slots</h3>
        <p className="text-gray-500">
          Interview slots will appear here when the admin opens new dates. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Available Interview Dates</h3>
          <p className="text-sm text-gray-600">Choose a date that works best for you (within 30 days)</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-800">{slots.length} slots available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((slot) => {
          const availableSpots = slot.capacity - slot.bookedCount;
          const fillPercentage = (slot.bookedCount / slot.capacity) * 100;
          const almostFull = fillPercentage >= 70;

          return (
            <div
              key={slot.id}
              className={`bg-white rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                isToday(slot.date) 
                  ? 'border-orange-400 bg-orange-50' 
                  : isSoon(slot.date)
                  ? 'border-blue-300'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Date Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`text-sm font-semibold mb-1 ${
                    isToday(slot.date) ? 'text-orange-600' : 'text-blue-600'
                  }`}>
                    {getDayOfWeek(slot.date)}
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {new Date(slot.date).getDate()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                
                {isToday(slot.date) && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    TODAY
                  </span>
                )}
                {isSoon(slot.date) && !isToday(slot.date) && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SOON
                  </span>
                )}
              </div>

              {/* Availability Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} className={almostFull ? 'text-orange-500' : 'text-blue-500'} />
                  <span>
                    <strong className={almostFull ? 'text-orange-600' : 'text-blue-600'}>
                      {availableSpots}
                    </strong> spot{availableSpots !== 1 ? 's' : ''} left
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      almostFull ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500">
                  {slot.bookedCount} of {slot.capacity} slots booked
                </p>
              </div>

              {/* Book Button */}
              <button
                onClick={() => onBook(slot)}
                disabled={loading || availableSpots === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  availableSpots === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:from-blue-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                } disabled:opacity-50`}
              >
                {availableSpots === 0 ? (
                  <>
                    <X size={18} />
                    Fully Booked
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Book This Date
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}