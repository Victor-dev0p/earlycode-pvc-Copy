import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { tutorCourseId, paymentReference } = await request.json();

    if (!tutorCourseId || !paymentReference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Verify payment with Paystack/Flutterwave
    // For now, we'll just mark as paid (you'll integrate payment gateway)
    
    const tutorCourseRef = doc(db, 'tutorCourses', tutorCourseId);
    const tutorCourseSnap = await getDoc(tutorCourseRef);

    if (!tutorCourseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course selection not found' },
        { status: 404 }
      );
    }

    // Update payment status
    await updateDoc(tutorCourseRef, {
      paymentStatus: 'paid',
      paymentReference,
      paidAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully!',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}