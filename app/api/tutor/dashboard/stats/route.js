import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorEmail = searchParams.get('tutorEmail');

    console.log('📊 Getting stats for:', tutorEmail);

    if (!tutorEmail) {
      return NextResponse.json(
        { error: 'Tutor email required' },
        { status: 400 }
      );
    }

    // Get tutor
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', tutorEmail));
    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    const tutorDoc = userSnap.docs[0];
    const tutor = tutorDoc.data();
    const tutorId = tutorDoc.id;

    // Get pairing requests
    const pairingsRef = collection(db, 'pairings');
    const pairingsQuery = query(
      pairingsRef,
      where('tutorId', '==', tutorId)
    );
    const pairingsSnap = await getDocs(pairingsQuery);

    const pendingPairings = [];
    const activePairings = [];
    const completedPairings = [];

    pairingsSnap.forEach(doc => {
      const pairing = { id: doc.id, ...doc.data() };
      
      if (pairing.status === 'pending') {
        pendingPairings.push(pairing);
      } else if (pairing.status === 'accepted' || pairing.status === 'active') {
        activePairings.push(pairing);
      } else if (pairing.status === 'completed') {
        completedPairings.push(pairing);
      }
    });

    console.log('✅ Stats retrieved:', {
      currentStudents: tutor.currentStudentCount || 0,
      pending: pendingPairings.length,
      active: activePairings.length
    });

    return NextResponse.json({
      success: true,
      stats: {
        tier: tutor.pairingTier || 1,
        performanceScore: tutor.performanceScore || 0,
        currentStudents: tutor.currentStudentCount || 0,
        maxStudents: tutor.maxConcurrentStudents || 1,
        totalPaired: tutor.totalStudentsPaired || 0,
        metrics: tutor.performanceMetrics || {
          attendance: 0,
          assignments: 0,
          exams: 0,
          reviews: 0
        }
      },
      pairings: {
        pending: pendingPairings,
        active: activePairings,
        completed: completedPairings
      }
    });
  } catch (error) {
    console.error('❌ Get tutor stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', details: error.message },
      { status: 500 }
    );
  }
}
