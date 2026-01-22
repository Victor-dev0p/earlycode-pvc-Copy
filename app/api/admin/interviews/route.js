
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy
} from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');

    if (view === 'bookings') {
      const bookingsRef = collection(db, 'interviews');
      const q = query(bookingsRef, orderBy('bookedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return NextResponse.json({
        success: true,
        bookings,
      });
    } else if (view === 'slots') {
      const slotsRef = collection(db, 'interviewSlots');
      const querySnapshot = await getDocs(slotsRef);

      const slots = [];
      querySnapshot.forEach((doc) => {
        slots.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      slots.sort((a, b) => {
        const timeA = a.dateTimestamp || new Date(a.date).getTime();
        const timeB = b.dateTimestamp || new Date(b.date).getTime();
        return timeA - timeB;
      });

      return NextResponse.json({
        success: true,
        slots,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid view parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Get interviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { date, capacity } = await request.json();

    if (!date || !capacity) {
      return NextResponse.json(
        { error: 'Date and capacity are required' },
        { status: 400 }
      );
    }

    // Parse datetime-local input: "2025-12-06T14:30"
    // IMPORTANT: This creates a date in LOCAL timezone
    const [datePart, timePart] = date.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = (timePart || '00:00').split(':').map(Number);
    
    // Create date in local timezone
    const dateObj = new Date(year, month - 1, day, hour, minute, 0, 0);
    const dateTimestamp = dateObj.getTime();
    
    console.log('Creating slot:', {
      input: date,
      parsed: dateObj.toISOString(),
      timestamp: dateTimestamp,
      local: dateObj.toLocaleString()
    });

    if (isNaN(dateTimestamp)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if in future
    if (dateTimestamp < Date.now()) {
      return NextResponse.json(
        { error: 'Date must be in the future' },
        { status: 400 }
      );
    }

    const slotsRef = collection(db, 'interviewSlots');
    const slotData = {
      date,
      dateTimestamp,
      dateDisplay: dateObj.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      capacity: parseInt(capacity),
      bookedCount: 0,
      status: 'open',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await addDoc(slotsRef, slotData);

    console.log('✅ Slot created:', docRef.id);

    return NextResponse.json({
      success: true,
      slotId: docRef.id,
      slot: { id: docRef.id, ...slotData },
      message: 'Interview slot created successfully',
    });
  } catch (error) {
    console.error('Create slot error:', error);
    return NextResponse.json(
      { error: 'Failed to create slot', details: error.message },
      { status: 500 }
    );
  }
}