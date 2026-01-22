// ============================================
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { pairingId, response, tutorId } = await request.json();
    // response: 'accept' or 'decline'

    if (!pairingId || !response || !tutorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pairingRef = doc(db, 'pairings', pairingId);
    const pairingSnap = await getDoc(pairingRef);

    if (!pairingSnap.exists()) {
      return NextResponse.json(
        { error: 'Pairing not found' },
        { status: 404 }
      );
    }

    const pairingData = pairingSnap.data();

    // Verify tutor
    if (pairingData.tutorId !== tutorId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (response === 'accept') {
      // Accept pairing
      await updateDoc(pairingRef, {
        status: 'accepted',
        tutorResponse: 'accepted',
        respondedAt: Date.now(),
        updatedAt: Date.now()
      });

      // Increment tutor's current student count
      await updateDoc(doc(db, 'users', tutorId), {
        currentStudentCount: increment(1),
        totalStudentsPaired: increment(1),
        updatedAt: Date.now()
      });

      return NextResponse.json({
        success: true,
        message: 'Pairing accepted successfully'
      });
    } else if (response === 'decline') {
      // Decline pairing
      await updateDoc(pairingRef, {
        status: 'declined',
        tutorResponse: 'declined',
        respondedAt: Date.now(),
        updatedAt: Date.now()
      });

      // TODO: Trigger re-pairing with next available tutor
      // This should call the pairing algorithm again for this student

      return NextResponse.json({
        success: true,
        message: 'Pairing declined. Student will be paired with next available tutor.'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid response' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Pairing response error:', error);
    return NextResponse.json(
      { error: 'Failed to respond to pairing', details: error.message },
      { status: 500 }
    );
  }
}