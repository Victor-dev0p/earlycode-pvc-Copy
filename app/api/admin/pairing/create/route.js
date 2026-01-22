import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { studentId, courseId } = await request.json();

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Student ID and Course ID required' },
        { status: 400 }
      );
    }

    console.log('🎯 Starting pairing for student:', studentId, 'course:', courseId);

    // Get student details
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    if (!studentDoc.exists()) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    const studentData = studentDoc.data();

    // Get course details
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (!courseDoc.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    const courseData = courseDoc.data();

    // Find eligible tutors (FIRST COME FIRST SERVE)
    const tutorsRef = collection(db, 'users');
    const eligibleQuery = query(
      tutorsRef,
      where('role', '==', 'tutor'),
      where('tutorStatus', '==', 'active'),
      where('onboardingCompleted', '==', true),
      orderBy('createdAt', 'asc') // First registered tutors first
    );
    
    const tutorsSnap = await getDocs(eligibleQuery);

    if (tutorsSnap.empty) {
      return NextResponse.json(
        { error: 'No active tutors available' },
        { status: 404 }
      );
    }

    console.log('📋 Found', tutorsSnap.size, 'eligible tutors');

    // Filter tutors who:
    // 1. Teach this course (passed interview for it)
    // 2. Have capacity (currentStudentCount < maxConcurrentStudents)
    const tutorCoursesRef = collection(db, 'tutorCourses');
    const availableTutors = [];

    for (const tutorDoc of tutorsSnap.docs) {
      const tutor = tutorDoc.data();
      const tutorId = tutorDoc.id;

      // Check if tutor teaches this course
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

        if (currentCount < maxCount) {
          availableTutors.push({
            id: tutorId,
            ...tutor,
            availableSlots: maxCount - currentCount
          });
        }
      }
    }

    if (availableTutors.length === 0) {
      return NextResponse.json(
        { error: 'No tutors with capacity available for this course' },
        { status: 404 }
      );
    }

    console.log('✅ Found', availableTutors.length, 'tutors with capacity');

    // Select first available tutor (first-come-first-serve)
    const selectedTutor = availableTutors[0];

    console.log('🎯 Selected tutor:', selectedTutor.email);

    // Create pairing request
    const pairingData = {
      studentId,
      studentEmail: studentData.email,
      studentName: studentData.name || studentData.email.split('@')[0],
      tutorId: selectedTutor.id,
      tutorEmail: selectedTutor.email,
      tutorName: selectedTutor.name || selectedTutor.email.split('@')[0],
      courseId,
      courseName: courseData.title,
      status: 'pending', // pending, accepted, declined, active, completed
      tutorResponse: null,
      studentSchedule: studentData.preferredSchedule || {},
      requestedAt: Date.now(),
      expiresAt: Date.now() + (48 * 60 * 60 * 1000), // 48 hours to respond
      updatedAt: Date.now()
    };

    const pairingDoc = await addDoc(collection(db, 'pairings'), pairingData);

    console.log('✅ Pairing request created:', pairingDoc.id);

    return NextResponse.json({
      success: true,
      pairingId: pairingDoc.id,
      tutorId: selectedTutor.id,
      tutorEmail: selectedTutor.email,
      message: 'Pairing request created successfully'
    });
  } catch (error) {
    console.error('❌ Pairing creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create pairing', details: error.message },
      { status: 500 }
    );
  }
}
