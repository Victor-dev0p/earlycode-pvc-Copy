import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const body = await request.json();
    const { 
      tutorEmail,
      studentAttended,  // true/false - TUTOR marks this
      tutorNotes
    } = body;

    console.log('✅ [SESSION COMPLETE] Request:', { id, tutorEmail, studentAttended });

    if (!tutorEmail) {
      return NextResponse.json(
        { success: false, error: 'Tutor email required' },
        { status: 400 }
      );
    }

    if (studentAttended === undefined || studentAttended === null) {
      return NextResponse.json(
        { success: false, error: 'Attendance status required' },
        { status: 400 }
      );
    }

    // Get session
    const sessionRef = doc(db, 'sessions', id);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const sessionData = sessionSnap.data();

    // Verify tutor owns this session
    if (sessionData.tutorEmail !== tutorEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already completed
    if (sessionData.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Session already marked as completed' },
        { status: 400 }
      );
    }

    // Update session
    await updateDoc(sessionRef, {
      status: 'completed',
      studentAttended,  // Tutor's record of attendance
      tutorNotes: tutorNotes || sessionData.tutorNotes || '',
      sessionCompletedAt: Date.now(),
      updatedAt: Date.now()
    });

    console.log('✅ [SESSION COMPLETE] Session marked complete');

    // TODO: Send email to student requesting review
    // We'll add this in the email service later

    return NextResponse.json({
      success: true,
      message: 'Session marked as completed'
    });

  } catch (error) {
    console.error('❌ [SESSION COMPLETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete session', details: error.message },
      { status: 500 }
    );
  }
}