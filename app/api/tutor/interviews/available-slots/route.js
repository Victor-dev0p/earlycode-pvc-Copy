import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorEmail = searchParams.get('tutorEmail');

    if (!tutorEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing tutorEmail' },
        { status: 400 }
      );
    }

    // Check existing bookings
    const interviewsRef = collection(db, 'interviews');
    const tutorQuery = query(interviewsRef, where('tutorEmail', '==', tutorEmail));
    const existing = await getDocs(tutorQuery);

    if (!existing.empty) {
      return NextResponse.json({
        success: false,
        alreadyBooked: true,
      });
    }

    // Get all slots
    const slotsRef = collection(db, 'interviewSlots');
    const slotsSnapshot = await getDocs(slotsRef);

    const now = Date.now();
    const availableSlots = [];

    slotsSnapshot.forEach(doc => {
      const slot = doc.data();
      const slotTime = slot.dateTimestamp;
      
      // Must be in future AND have capacity AND be open
      if (slotTime > now && 
          slot.bookedCount < slot.capacity && 
          slot.status === 'open') {
        availableSlots.push({
          id: doc.id,
          ...slot
        });
      }
    });

    availableSlots.sort((a, b) => a.dateTimestamp - b.dateTimestamp);

    return NextResponse.json({
      success: true,
      slots: availableSlots,
    });
  } catch (error) {
    console.error('Available slots error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
