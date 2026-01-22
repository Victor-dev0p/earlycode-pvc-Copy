import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const usersRef = collection(db, 'users');
    const studentsQuery = query(usersRef, where('role', '==', 'student'));
    const studentsSnap = await getDocs(studentsQuery);

    const students = [];

    for (const doc of studentsSnap.docs) {
      const studentData = doc.data();
      const studentId = doc.id;

      // Get enrollments count
      const enrollmentsRef = collection(db, 'enrollments');
      const enrollQuery = query(enrollmentsRef, where('studentId', '==', studentId));
      const enrollSnap = await getDocs(enrollQuery);

      // Get pairing status - check for accepted/active pairings
      const pairingsRef = collection(db, 'pairings');
      const pairQuery = query(pairingsRef, where('studentId', '==', studentId));
      const pairSnap = await getDocs(pairQuery);

      let pairingStatus = 'none';
      if (!pairSnap.empty) {
        const pairings = pairSnap.docs.map(d => d.data());
        // Check if ANY pairing is accepted or active
        const hasPairedStatus = pairings.some(p => p.status === 'accepted' || p.status === 'active');
        if (hasPairedStatus) {
          pairingStatus = 'accepted'; // Show as paired
        } else {
          const latestPairing = pairings.sort((a, b) => b.requestedAt - a.requestedAt)[0];
          pairingStatus = latestPairing.status;
        }
      }

      students.push({
        id: studentId,
        name: studentData.name || 'Unnamed Student',
        email: studentData.email,
        phone: studentData.phone,
        createdAt: studentData.createdAt,
        enrollments: enrollSnap.size,
        pairingStatus
      });
    }

    console.log('✅ Admin students:', students.length, 'total');
    console.log('Paired count:', students.filter(s => s.pairingStatus === 'accepted').length);

    return NextResponse.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}