import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorEmail = searchParams.get('tutorEmail');

    if (!tutorEmail) {
      return NextResponse.json(
        { error: 'Tutor email required' },
        { status: 400 }
      );
    }

    // Get tutor ID
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', tutorEmail));
    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    const tutorId = userSnap.docs[0].id;

    // Get pairings
    const pairingsRef = collection(db, 'pairings');
    const pairingsQuery = query(pairingsRef, where('tutorId', '==', tutorId));
    const pairingsSnap = await getDocs(pairingsQuery);

    const pairings = pairingsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      pairings
    });
  } catch (error) {
    console.error('Get pairings error:', error);
    return NextResponse.json(
      { error: 'Failed to get pairings' },
      { status: 500 }
    );
  }
}