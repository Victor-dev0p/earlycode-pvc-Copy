'use client';

import { useState } from 'react';
import styles from './CalendarStyles.module.css';

export default function CreativeCalendar({ slots, onSelectDate }) {
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Group slots by week
  const groupByWeek = (slots) => {
    const weeks = {};
    slots.forEach(slot => {
      const weekStart = getWeekStart(slot.date);
      if (!weeks[weekStart]) weeks[weekStart] = [];
      weeks[weekStart].push(slot);
    });
    return weeks;
  };
  
  const weeks = groupByWeek(slots);
  
  return (
    <div className={styles.calendarContainer}>
      <h2>Select Your Interview Date</h2>
      <p className={styles.subtitle}>Pick a date within the next 30 days</p>
      
      {Object.entries(weeks).map(([week, weekSlots]) => (
        <div key={week} className={styles.weekRow}>
          <div className={styles.weekLabel}>
            Week of {formatDate(new Date(week))}
          </div>
          <div className={styles.daysGrid}>
            {weekSlots.map(slot => (
              <button
                key={slot.id}
                className={`${styles.dayCard} ${
                  !slot.available ? styles.disabled : ''
                } ${selectedDate?.id === slot.id ? styles.selected : ''}`}
                disabled={!slot.available}
                onClick={() => {
                  setSelectedDate(slot);
                  onSelectDate(slot);
                }}
              >
                <div className={styles.dayDate}>
                  {slot.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className={styles.dayName}>
                  {slot.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={styles.slotsInfo}>
                  {slot.available ? (
                    <>
                      <span className={styles.available}>
                        {slot.capacity - slot.filledSlots} slots
                      </span>
                    </>
                  ) : (
                    <span className={styles.full}>FULL</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}