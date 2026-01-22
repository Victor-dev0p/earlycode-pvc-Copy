// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

// Format date
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format duration
export const formatDuration = (months) => {
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate email
export const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

// Calculate total sessions
export const calculateTotalSessions = (durationMonths, frequencyDaysPerWeek) => {
  const weeksPerMonth = 4;
  const totalWeeks = durationMonths * weeksPerMonth;
  return totalWeeks * frequencyDaysPerWeek;
};

// ============= TIME UTILITIES FOR SESSIONS =============

/**
 * Get human-readable time until a future timestamp
 * 🔧 FIXED: Better handling of negative values (session has started)
 */
export function getTimeUntil(timestamp) {
  const now = Date.now();
  const sessionTime = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diff = sessionTime - now;
  
  // 🔧 FIX: Handle sessions that have started
  if (diff < 0) {
    const hoursSinceStart = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    if (hoursSinceStart < 2) {
      return 'Started';
    }
    return 'Past';
  }
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) {
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  }
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  return 'less than a minute';
}

/**
 * Check if user can join meeting (within time window)
 * 🔧 FIXED: Can join 15 mins before until 2 hours after
 */
export function canJoinMeeting(scheduledTime, windowMinutes = 15) {
  const now = Date.now();
  const sessionTime = typeof scheduledTime === 'number' ? scheduledTime : new Date(scheduledTime).getTime();
  
  const diff = sessionTime - now;
  const minutesUntil = diff / 60000;
  
  // 🔧 FIX: Can join 15 mins before until 2 hours (120 mins) after
  return minutesUntil <= windowMinutes && minutesUntil >= -120;
}

/**
 * Check if session is upcoming (in the future)
 * 🔧 CRITICAL FIX: Sessions stay visible until 2 hours after start
 */
export function isUpcoming(scheduledTime) {
  const now = Date.now();
  const sessionTime = typeof scheduledTime === 'number' ? scheduledTime : new Date(scheduledTime).getTime();
  
  // 🔧 FIX: Consider session "upcoming" until 2 hours AFTER scheduled time
  // This prevents sessions from disappearing immediately when they start
  const twoHoursAfter = sessionTime + (2 * 60 * 60 * 1000);
  
  return now < twoHoursAfter;
}

/**
 * Check if session is in the past
 * 🔧 FIXED: Only past if more than 2 hours after scheduled time
 */
export function isPast(scheduledTime) {
  const now = Date.now();
  const sessionTime = typeof scheduledTime === 'number' ? scheduledTime : new Date(scheduledTime).getTime();
  
  // 🔧 FIX: Session is "past" only if it's more than 2 hours after scheduled time
  const twoHoursAfter = sessionTime + (2 * 60 * 60 * 1000);
  
  return now >= twoHoursAfter;
}

/**
 * Format date for datetime-local input
 */
export function formatDateTimeLocal(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse datetime-local string to timestamp
 */
export function parseDateTimeLocal(dateTimeStr) {
  if (!dateTimeStr) return null;
  
  const [datePart, timePart] = dateTimeStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = (timePart || '00:00').split(':').map(Number);
  
  const dateObj = new Date(year, month - 1, day, hour, minute, 0, 0);
  return dateObj.getTime();
}

/**
 * Get friendly date display
 */
export function getFriendlyDateTime(timestamp) {
  const date = new Date(timestamp);
  
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}