import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { tutorEmail } = await request.json();

    console.log('✅ Completing onboarding for:', tutorEmail);

    if (!tutorEmail) {
      return NextResponse.json(
        { success: false, error: 'Tutor email required' },
        { status: 400 }
      );
    }

    // Get tutor
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', tutorEmail));
    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      return NextResponse.json(
        { success: false, error: 'Tutor not found' },
        { status: 404 }
      );
    }

    const tutorDoc = userSnap.docs[0];
    const tutorId = tutorDoc.id;

    // Update tutor as onboarded and ready for pairing
    await updateDoc(doc(db, 'users', tutorId), {
      onboardingCompleted: true,
      onboardingCompletedAt: Date.now(),
      tutorStatus: 'active', // Now active and ready for pairing
      // Initialize pairing tier system
      pairingTier: 1,
      maxConcurrentStudents: 1,
      currentStudentCount: 0,
      totalStudentsPaired: 0,
      performanceScore: 0,
      updatedAt: Date.now()
    });

    console.log('✅ Onboarding completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    console.error('❌ Complete onboarding error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding', details: error.message },
      { status: 500 }
    );
  }
}