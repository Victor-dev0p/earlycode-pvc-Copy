import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { studentEmail, courseId } = await request.json();

    console.log('🎓 ENROLLMENT REQUEST:', { studentEmail, courseId });

    if (!studentEmail || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Student email and course ID required' },
        { status: 400 }
      );
    }

    // Get student ID
    const usersRef = collection(db, 'users');
    const studentQuery = query(usersRef, where('email', '==', studentEmail));
    const studentSnap = await getDocs(studentQuery);

    if (studentSnap.empty) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const studentId = studentSnap.docs[0].id;
    const studentData = studentSnap.docs[0].data();

    console.log('✅ Student found:', studentId);

    // ✅ CHECK IF ALREADY ENROLLED (IMPORTANT!)
    const enrollmentsRef = collection(db, 'enrollments');
    const existingQuery = query(
      enrollmentsRef,
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    const existing = await getDocs(existingQuery);

    if (!existing.empty) {
      console.log('⚠️ Already enrolled!');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Already enrolled in this course',
          alreadyEnrolled: true // Flag for UI
        },
        { status: 409 } // Conflict status
      );
    }

    // Create enrollment
    const enrollmentData = {
      studentId,
      studentEmail,
      courseId,
      enrolledAt: Date.now(),
      status: 'pending_pairing',
      progress: 0,
      updatedAt: Date.now()
    };

    const enrollmentDoc = await addDoc(enrollmentsRef, enrollmentData);
    console.log('✅ Enrollment created:', enrollmentDoc.id);

    // 🎯 AUTO-TRIGGER PAIRING
    console.log('🎯 Starting pairing algorithm...');

    try {
      // Get course details
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      const courseData = courseDoc.exists() ? courseDoc.data() : {};

      // Find eligible tutors - REMOVED orderBy to avoid index
      const tutorsQuery = query(
        usersRef,
        where('role', '==', 'tutor'),
        where('tutorStatus', '==', 'active'),
        where('onboardingCompleted', '==', true)
      );
      
      const tutorsSnap = await getDocs(tutorsQuery);
      console.log(`📋 Found ${tutorsSnap.size} active tutors`);

      if (tutorsSnap.empty) {
        console.log('⚠️ No active tutors available');
        return NextResponse.json({
          success: true,
          enrollmentId: enrollmentDoc.id,
          pairingCreated: false,
          message: 'Enrolled successfully. No active tutors available yet.'
        });
      }

      // Sort tutors manually by createdAt (first-come-first-serve)
      const sortedTutors = tutorsSnap.docs.sort((a, b) => {
        const timeA = a.data().createdAt || 0;
        const timeB = b.data().createdAt || 0;
        return timeA - timeB;
      });

      console.log('✅ Tutors sorted by registration date');

      // Filter tutors who teach this course and have capacity
      const tutorCoursesRef = collection(db, 'tutorCourses');
      let selectedTutor = null;

      for (const tutorDoc of sortedTutors) {
        const tutor = tutorDoc.data();
        const tutorId = tutorDoc.id;

        console.log(`🔍 Checking tutor: ${tutor.email}`);

        // Check if tutor teaches this course (passed interview)
        const tutorCourseQuery = query(
          tutorCoursesRef,
          where('tutorId', '==', tutorId),
          where('courseId', '==', courseId),
          where('interviewStatus', '==', 'passed')
        );
        const tutorCourseSnap = await getDocs(tutorCourseQuery);

        if (!tutorCourseSnap.empty) {
          // Check capacity
          const currentCount = tutor.currentStudentCount || 0;
          const maxCount = tutor.maxConcurrentStudents || 1;

          console.log(`  - Current: ${currentCount}, Max: ${maxCount}`);

          if (currentCount < maxCount) {
            selectedTutor = {
              id: tutorId,
              ...tutor
            };
            console.log(`✅ SELECTED TUTOR: ${selectedTutor.email}`);
            break;
          }
        } else {
          console.log(`  - Does not teach this course`);
        }
      }

      if (!selectedTutor) {
        console.log('⚠️ No tutors with capacity available');
        return NextResponse.json({
          success: true,
          enrollmentId: enrollmentDoc.id,
          pairingCreated: false,
          message: 'Enrolled successfully. All tutors are at capacity.'
        });
      }

      // Create pairing request
      const pairingData = {
        studentId,
        studentEmail,
        studentName: studentData.name || studentData.email.split('@')[0],
        tutorId: selectedTutor.id,
        tutorEmail: selectedTutor.email,
        tutorName: selectedTutor.name || selectedTutor.email.split('@')[0],
        courseId,
        courseName: courseData.title || 'Unknown Course',
        status: 'pending',
        tutorResponse: null,
        requestedAt: Date.now(),
        expiresAt: Date.now() + (48 * 60 * 60 * 1000),
        updatedAt: Date.now()
      };

      const pairingsRef = collection(db, 'pairings');
      const pairingDoc = await addDoc(pairingsRef, pairingData);

      console.log('✅ PAIRING CREATED:', pairingDoc.id);

      // Update enrollment status
      await updateDoc(enrollmentDoc, {
        status: 'pairing_pending',
        pairingId: pairingDoc.id
      });

      return NextResponse.json({
        success: true,
        enrollmentId: enrollmentDoc.id,
        pairingId: pairingDoc.id,
        pairingCreated: true,
        tutorAssigned: {
          id: selectedTutor.id,
          email: selectedTutor.email,
          name: selectedTutor.name
        },
        message: 'Enrolled and tutor assigned! Waiting for tutor to accept.'
      });

    } catch (pairingError) {
      console.error('❌ Pairing error:', pairingError);
      // Enrollment succeeded, pairing failed
      return NextResponse.json({
        success: true,
        enrollmentId: enrollmentDoc.id,
        pairingCreated: false,
        error: 'Enrolled but pairing failed: ' + pairingError.message
      });
    }

  } catch (error) {
    console.error('❌ Enrollment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to enroll', details: error.message },
      { status: 500 }
    );
  }
}