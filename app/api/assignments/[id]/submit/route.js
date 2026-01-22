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
      submissionUrl  // Link or text submission
    } = body;

    console.log('📤 [ASSIGNMENT SUBMIT] Request:', { id, studentEmail });

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email required' },
        { status: 400 }
      );
    }

    if (!submissionUrl) {
      return NextResponse.json(
        { success: false, error: 'Submission required' },
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

    // Verify student owns this assignment
    if (assignmentData.studentEmail !== studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already graded
    if (assignmentData.status === 'graded') {
      return NextResponse.json(
        { success: false, error: 'Cannot resubmit a graded assignment' },
        { status: 400 }
      );
    }

    // Update assignment with submission
    await updateDoc(assignmentRef, {
      submissionUrl,
      submittedAt: Date.now(),
      status: 'submitted',
      updatedAt: Date.now()
    });

    console.log('✅ [ASSIGNMENT SUBMIT] Submission recorded');

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully'
    });

  } catch (error) {
    console.error('❌ [ASSIGNMENT SUBMIT] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit assignment', details: error.message },
      { status: 500 }
    );
  }
}