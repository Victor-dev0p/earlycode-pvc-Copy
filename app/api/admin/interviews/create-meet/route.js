import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { interviewId, googleMeetLink } = await request.json();

    if (!interviewId || !googleMeetLink) {
      return NextResponse.json(
        { error: 'Interview ID and Google Meet link are required' },
        { status: 400 }
      );
    }

    // Validate Google Meet link format
    if (!googleMeetLink.includes('meet.google.com')) {
      return NextResponse.json(
        { error: 'Invalid Google Meet link' },
        { status: 400 }
      );
    }

    const interviewRef = doc(db, 'interviews', interviewId);
    const interviewSnap = await getDoc(interviewRef);

    if (!interviewSnap.exists()) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Update interview with Google Meet link
    await updateDoc(interviewRef, {
      googleMeetLink,
      status: 'scheduled',
      updatedAt: new Date().getTime(),
    });

    return NextResponse.json({
      success: true,
      message: 'Google Meet link added successfully',
    });
  } catch (error) {
    console.error('Create meet error:', error);
    return NextResponse.json(
      { error: 'Failed to add Google Meet link' },
      { status: 500 }
    );
  }
}