import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, query, collection, where, getDocs } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { pairingId, response, tutorId } = await request.json();

    if (!pairingId || !response || !tutorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pairingRef = doc(db, 'pairings', pairingId);
    const pairingSnap = await getDoc(pairingRef);

    if (!pairingSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Pairing not found' },
        { status: 404 }
      );
    }

    const pairingData = pairingSnap.data();

    if (pairingData.tutorId !== tutorId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (response === 'accept') {
      // Update pairing status
      await updateDoc(pairingRef, {
        status: 'accepted',
        tutorResponse: 'accepted',
        respondedAt: Date.now(),
        updatedAt: Date.now()
      });

      // Update tutor's student count
      await updateDoc(doc(db, 'users', tutorId), {
        currentStudentCount: increment(1),
        totalStudentsPaired: increment(1),
        updatedAt: Date.now()
      });

      // ✅ UPDATE ENROLLMENT STATUS
      const enrollmentsRef = collection(db, 'enrollments');
      const enrollQuery = query(
        enrollmentsRef,
        where('studentId', '==', pairingData.studentId),
        where('courseId', '==', pairingData.courseId)
      );
      const enrollSnap = await getDocs(enrollQuery);

      if (!enrollSnap.empty) {
        const enrollDoc = enrollSnap.docs[0];
        await updateDoc(enrollDoc.ref, {
          status: 'active',
          tutorId: tutorId,
          pairingAcceptedAt: Date.now(),
          updatedAt: Date.now()
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Pairing accepted successfully'
      });
    } else if (response === 'decline') {
      await updateDoc(pairingRef, {
        status: 'declined',
        tutorResponse: 'declined',
        respondedAt: Date.now(),
        updatedAt: Date.now()
      });

      return NextResponse.json({
        success: true,
        message: 'Pairing declined'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid response' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Pairing response error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to respond', details: error.message },
      { status: 500 }
    );
  }
}