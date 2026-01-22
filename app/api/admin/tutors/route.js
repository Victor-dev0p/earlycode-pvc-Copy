import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // 'all', 'active', 'passed'

    const usersRef = collection(db, 'users');
    let q;

    if (view === 'active') {
      // Active = passed interview AND onboarded
      q = query(
        usersRef, 
        where('role', '==', 'tutor'),
        where('tutorStatus', '==', 'passed'),
        where('onboardingCompleted', '==', true)
      );
    } else if (view === 'passed') {
      // Passed = just passed interview
      q = query(
        usersRef,
        where('role', '==', 'tutor'),
        where('tutorStatus', '==', 'passed')
      );
    } else {
      // All tutors
      q = query(usersRef, where('role', '==', 'tutor'));
    }

    const snapshot = await getDocs(q);
    const tutors = [];
    
    snapshot.forEach(doc => {
      tutors.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      tutors,
      count: tutors.length
    });
  } catch (error) {
    console.error('Get tutors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutors', details: error.message },
      { status: 500 }
    );
  }
}