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
      score,      // 0-100
      feedback    // Optional feedback text
    } = body;

    console.log('📊 [ASSIGNMENT GRADE] Request:', { id, tutorEmail, score });

    if (!tutorEmail) {
      return NextResponse.json(
        { success: false, error: 'Tutor email required' },
        { status: 400 }
      );
    }

    if (score === undefined || score === null || score < 0 || score > 100) {
      return NextResponse.json(
        { success: false, error: 'Valid score (0-100) required' },
        { status: 400 }
      );
    }

    // Get assignment
    const assignmentRef = doc(db, 'assignments', id);
    const assignmentSnap = await getDoc(assignmentRef);

    if (!assignmentSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const assignmentData = assignmentSnap.data();

    // Verify tutor owns this assignment
    if (assignmentData.tutorEmail !== tutorEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if assignment is submitted
    if (assignmentData.status !== 'submitted') {
      return NextResponse.json(
        { success: false, error: 'Assignment must be submitted before grading' },
        { status: 400 }
      );
    }

    // Update assignment with grade
    await updateDoc(assignmentRef, {
      score,
      feedback: feedback || '',
      gradedAt: Date.now(),
      status: 'graded',
      updatedAt: Date.now()
    });

    console.log('✅ [ASSIGNMENT GRADE] Grade recorded');

    // 🎯 SYNC SCORE TO SESSION
    try {
      const sessionRef = doc(db, 'sessions', assignmentData.sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        await updateDoc(sessionRef, {
          assignmentId: id,
          assignmentScore: score,
          updatedAt: Date.now()
        });
        console.log('✅ [ASSIGNMENT GRADE] Score synced to session');
      }
    } catch (syncError) {
      console.error('⚠️ [ASSIGNMENT GRADE] Session sync failed:', syncError);
      // Don't fail grading if sync fails
    }

    // 🎯 TRIGGER PERFORMANCE RECALCULATION
    try {
      console.log('🎯 [ASSIGNMENT GRADE] Triggering performance calculation for tutor:', assignmentData.tutorId);
      
      const perfResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tutors/calculate-performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId: assignmentData.tutorId })
      });
      
      if (perfResponse.ok) {
        const perfData = await perfResponse.json();
        console.log('✅ [ASSIGNMENT GRADE] Performance recalculated:', perfData);
      } else {
        console.error('⚠️ [ASSIGNMENT GRADE] Performance calculation failed');
      }
    } catch (perfError) {
      console.error('⚠️ [ASSIGNMENT GRADE] Performance calculation error:', perfError);
      // Don't fail grading if performance calc fails
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment graded successfully'
    });

  } catch (error) {
    console.error('❌ [ASSIGNMENT GRADE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to grade assignment', details: error.message },
      { status: 500 }
    );
  }
}