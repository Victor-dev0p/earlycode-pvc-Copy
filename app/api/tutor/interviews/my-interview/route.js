import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorEmail = searchParams.get('email');

    if (!tutorEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get tutor's interview
    const interviewsRef = collection(db, 'interviews');
    const q = query(interviewsRef, where('tutorEmail', '==', tutorEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({
        success: true,
        interview: null,
        hasInterview: false,
      });
    }

    const interviewDoc = querySnapshot.docs[0];
    const interview = {
      id: interviewDoc.id,
      ...interviewDoc.data(),
    };

    return NextResponse.json({
      success: true,
      interview,
      hasInterview: true,
    });
  } catch (error) {
    console.error('Get my interview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview' },
      { status: 500 }
    );
  }
}