import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('📡 Fetching enrollments for:', email);

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
    console.log('✅ Student ID:', studentId);

    // Get enrollments
    const enrollmentsRef = collection(db, 'enrollments');
    const enrollQuery = query(enrollmentsRef, where('studentId', '==', studentId));
    const enrollSnap = await getDocs(enrollQuery);

    console.log('✅ Found', enrollSnap.size, 'enrollments');

    const enrollments = [];

    for (const enrollDoc of enrollSnap.docs) {
      const enrollment = enrollDoc.data();

      // Get course details
      const courseDoc = await getDoc(doc(db, 'courses', enrollment.courseId));
      const courseData = courseDoc.exists() ? courseDoc.data() : {};

      // Get pairing info
      const pairingsRef = collection(db, 'pairings');
      const pairingQuery = query(
        pairingsRef,
        where('studentId', '==', studentId),
        where('courseId', '==', enrollment.courseId)
      );
      const pairingSnap = await getDocs(pairingQuery);

      let pairingStatus = 'none';
      let tutorName = null;
      let tutorEmail = null;

      if (!pairingSnap.empty) {
        const pairing = pairingSnap.docs[0].data();
        pairingStatus = pairing.status;
        tutorName = pairing.tutorName;
        tutorEmail = pairing.tutorEmail;
      }

      console.log('Enrollment:', {
        course: courseData.title,
        pairingStatus,
        tutor: tutorName
      });

      enrollments.push({
        id: enrollDoc.id,
        courseId: enrollment.courseId, // ✨ ADD THIS LINE: This is what the frontend needs!
        courseName: courseData.title || 'Unknown Course',
        enrolledAt: enrollment.enrolledAt,
        progressPercentage: enrollment.progress || 0,
        status: enrollment.status,
        pairingStatus,
        tutorName,
        tutorEmail
      });
    }

    console.log('✅ Returning', enrollments.length, 'enrollments with tutor info');

    return NextResponse.json({
      success: true,
      enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { error: 'Failed to get enrollments' },
      { status: 500 }
    );
  }
}