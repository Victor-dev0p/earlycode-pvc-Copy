import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('👤 Getting profile for:', email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log('✅ Profile found:', {
      role: userData.role,
      tutorStatus: userData.tutorStatus,
      onboardingCompleted: userData.onboardingCompleted
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile', details: error.message },
      { status: 500 }
    );
  }
}
