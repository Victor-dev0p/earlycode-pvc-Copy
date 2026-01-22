import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// PUT - Update session (Student confirms attendance and adds review)
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const body = await request.json();
    const { 
      studentConfirmed,
      studentAttended,
      studentRating,
      studentReview,
      assignmentScore,
      examScore
    } = body;

    console.log('📝 Updating session:', id);

    const sessionRef = doc(db, 'sessions', id);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const updateData = {
      updatedAt: Date.now()
    };

    // Student confirmation
    if (studentConfirmed !== undefined) {
      updateData.studentConfirmed = studentConfirmed;
    }

    if (studentAttended !== undefined) {
      updateData.studentAttended = studentAttended;
    }

    // Student review
    if (studentRating !== undefined) {
      updateData.studentRating = studentRating;
    }

    if (studentReview !== undefined) {
      updateData.studentReview = studentReview;
    }

    // Scores
    if (assignmentScore !== undefined) {
      updateData.assignmentScore = assignmentScore;
    }

    if (examScore !== undefined) {
      updateData.examScore = examScore;
    }

    await updateDoc(sessionRef, updateData);

    console.log('✅ Session updated');

    // 🎯 TRIGGER PERFORMANCE RECALCULATION
    if (studentRating || assignmentScore || examScore || studentAttended !== undefined) {
      const sessionData = sessionSnap.data();
      console.log('🎯 Triggering performance recalculation for tutor:', sessionData.tutorId);
      
      // Call performance calculation endpoint
      try {
        const perfResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tutors/calculate-performance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tutorId: sessionData.tutorId })
        });
        
        if (perfResponse.ok) {
          console.log('✅ Performance recalculated');
        }
      } catch (perfError) {
        console.error('⚠️ Performance calculation failed:', perfError);
        // Don't fail the session update if performance calc fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully'
    });
  } catch (error) {
    console.error('❌ Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get single session
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const sessionRef = doc(db, 'sessions', id);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: sessionSnap.id,
        ...sessionSnap.data()
      }
    });
  } catch (error) {
    console.error('❌ Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session', details: error.message },
      { status: 500 }
    );
  }
}