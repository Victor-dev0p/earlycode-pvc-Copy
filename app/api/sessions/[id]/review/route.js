import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const body = await request.json();
    const { 
      studentEmail,
      studentRating,    // 1-5 stars
      studentReview     // text review
    } = body;

    console.log('⭐ [SESSION REVIEW] Request:', { id, studentEmail, studentRating });

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email required' },
        { status: 400 }
      );
    }

    if (!studentRating || studentRating < 1 || studentRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Valid rating (1-5) required' },
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

    // Verify student owns this session
    if (sessionData.studentEmail !== studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if session is completed
    if (sessionData.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Session must be completed before reviewing' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    if (sessionData.studentConfirmed) {
      return NextResponse.json(
        { success: false, error: 'Session already reviewed' },
        { status: 400 }
      );
    }

    // Update session with review
    await updateDoc(sessionRef, {
      studentConfirmed: true,
      studentRating,
      studentReview: studentReview || '',
      reviewedAt: Date.now(),
      updatedAt: Date.now()
    });

    console.log('✅ [SESSION REVIEW] Review submitted');

    // 🎯 TRIGGER PERFORMANCE RECALCULATION
    try {
      console.log('🎯 [SESSION REVIEW] Triggering performance calculation for tutor:', sessionData.tutorId);
      
      // Call performance calculation endpoint
      const perfResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tutors/calculate-performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId: sessionData.tutorId })
      });
      
      if (perfResponse.ok) {
        const perfData = await perfResponse.json();
        console.log('✅ [SESSION REVIEW] Performance recalculated:', perfData);
      } else {
        console.error('⚠️ [SESSION REVIEW] Performance calculation failed');
      }
    } catch (perfError) {
      console.error('⚠️ [SESSION REVIEW] Performance calculation error:', perfError);
      // Don't fail the review if performance calc fails
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('❌ [SESSION REVIEW] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review', details: error.message },
      { status: 500 }
    );
  }
}