import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    // Get student ID
    const usersRef = collection(db, 'users');
    const studentQuery = query(usersRef, where('email', '==', email));
    const studentSnap = await getDocs(studentQuery);

    if (studentSnap.empty) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const studentId = studentSnap.docs[0].id;

    // Get enrollments
    const enrollmentsRef = collection(db, 'enrollments');
    const enrollQuery = query(enrollmentsRef, where('studentId', '==', studentId));
    const enrollSnap = await getDocs(enrollQuery);

    const courses = [];

    for (const enrollDoc of enrollSnap.docs) {
      const enrollment = enrollDoc.data();

      // Get course details
      const courseDoc = await getDoc(doc(db, 'courses', enrollment.courseId));
      const courseData = courseDoc.exists() ? courseDoc.data() : {};

      // Get pairing status
      const pairingsRef = collection(db, 'pairings');
      const pairingQuery = query(
        pairingsRef,
        where('studentId', '==', studentId),
        where('courseId', '==', enrollment.courseId)
      );
      const pairingSnap = await getDocs(pairingQuery);

      let pairingStatus = 'none';
      let tutorInfo = null;

      if (!pairingSnap.empty) {
        const pairing = pairingSnap.docs[0].data();
        pairingStatus = pairing.status;

        // Get tutor info if paired
        if ((pairing.status === 'accepted' || pairing.status === 'active') && pairing.tutorId) {
          const tutorDoc = await getDoc(doc(db, 'users', pairing.tutorId));
          if (tutorDoc.exists()) {
            const tutorData = tutorDoc.data();
            tutorInfo = {
              id: tutorDoc.id,
              name: tutorData.name || tutorData.email.split('@')[0],
              email: tutorData.email
            };
          }
        }
      }

      courses.push({
        id: enrollDoc.id,
        courseId: enrollment.courseId,
        courseName: courseData.title || 'Unknown Course',
        courseDescription: courseData.description,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress || 0,
        pairingStatus,
        tutor: tutorInfo
      });
    }

    return NextResponse.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Get student courses error:', error);
    return NextResponse.json(
      { error: 'Failed to get courses' },
      { status: 500 }
    );
  }
}
