// api/students/my-courses/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');

    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Student email required' },
        { status: 400 }
      );
    }

    // Get student ID
    const usersRef = collection(db, 'users');
    const studentQuery = query(usersRef, where('email', '==', studentEmail));
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
    const enrollmentsQuery = query(enrollmentsRef, where('studentId', '==', studentId));
    const enrollmentsSnap = await getDocs(enrollmentsQuery);

    const courses = [];

    for (const enrollmentDoc of enrollmentsSnap.docs) {
      const enrollment = enrollmentDoc.data();

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

      let pairingStatus = 'pending';
      let tutorInfo = null;

      if (!pairingSnap.empty) {
        const pairing = pairingSnap.docs[0].data();
        pairingStatus = pairing.status;

        if (pairing.tutorId) {
          const tutorDoc = await getDoc(doc(db, 'users', pairing.tutorId));
          if (tutorDoc.exists()) {
            tutorInfo = {
              id: tutorDoc.id,
              name: tutorDoc.data().name || tutorDoc.data().email,
              email: tutorDoc.data().email
            };
          }
        }
      }

      courses.push({
        id: enrollmentDoc.id,
        courseId: enrollment.courseId,
        courseName: courseData.title || 'Unknown Course',
        courseDescription: courseData.description,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress || 0,
        pairingStatus, // pending, accepted, declined, active, completed
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
      { error: 'Failed to get courses', details: error.message },
      { status: 500 }
    );
  }
}