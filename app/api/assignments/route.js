import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';

// GET - Fetch assignments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const tutorId = searchParams.get('tutorId');
    const studentId = searchParams.get('studentId');

    console.log('📝 [ASSIGNMENTS GET] Fetching:', { sessionId, tutorId, studentId });

    const assignmentsRef = collection(db, 'assignments');
    let q;

    if (sessionId) {
      q = query(assignmentsRef, where('sessionId', '==', sessionId));
    } else if (tutorId) {
      // Simple query without orderBy to avoid index requirement
      q = query(assignmentsRef, where('tutorId', '==', tutorId));
    } else if (studentId) {
      // Simple query without orderBy to avoid index requirement
      q = query(assignmentsRef, where('studentId', '==', studentId));
    } else {
      return NextResponse.json(
        { success: false, error: 'sessionId, tutorId, or studentId required' },
        { status: 400 }
      );
    }

    const snapshot = await getDocs(q);

    let assignments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort in memory instead of using Firestore orderBy
    assignments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    console.log(`✅ [ASSIGNMENTS GET] Found ${assignments.length} assignments`);

    return NextResponse.json({
      success: true,
      assignments
    });

  } catch (error) {
    console.error('❌ [ASSIGNMENTS GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create assignment (Tutor)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tutorEmail,
      sessionId,
      title,
      description,
      dueDate,
      maxScore
    } = body;

    console.log('📝 [ASSIGNMENTS POST] Creating:', { tutorEmail, sessionId, title });

    if (!tutorEmail || !sessionId || !title) {
      return NextResponse.json(
        { success: false, error: 'Tutor email, session ID, and title required' },
        { status: 400 }
      );
    }

    // Get session to get student info
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const sessionData = sessionSnap.data();

    console.log('📝 [ASSIGNMENTS POST] Session data:', {
      hasTutorEmail: !!sessionData.tutorEmail,
      hasTutorId: !!sessionData.tutorId,
      hasStudentEmail: !!sessionData.studentEmail
    });

    // Handle old sessions that might not have all fields
    if (!sessionData.tutorId || !sessionData.studentId) {
      return NextResponse.json(
        { success: false, error: 'Session is missing required tutor/student information. Please create a new session.' },
        { status: 400 }
      );
    }

    // Get tutor info from users collection if missing from session
    let finalTutorEmail = sessionData.tutorEmail || tutorEmail;
    let finalTutorName = sessionData.tutorName;

    if (!finalTutorName) {
      const tutorRef = doc(db, 'users', sessionData.tutorId);
      const tutorSnap = await getDoc(tutorRef);
      if (tutorSnap.exists()) {
        const tutorData = tutorSnap.data();
        finalTutorName = tutorData.name || tutorData.email;
        if (!finalTutorEmail) finalTutorEmail = tutorData.email;
      }
    }

    // Get student info from users collection if missing
    let finalStudentEmail = sessionData.studentEmail;
    let finalStudentName = sessionData.studentName;

    if (!finalStudentEmail || !finalStudentName) {
      const studentRef = doc(db, 'users', sessionData.studentId);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        finalStudentEmail = finalStudentEmail || studentData.email;
        finalStudentName = finalStudentName || studentData.name || studentData.email;
      }
    }

    // Create assignment with all required fields
    const assignmentData = {
      sessionId,
      tutorId: sessionData.tutorId,
      tutorEmail: finalTutorEmail,
      tutorName: finalTutorName || 'Unknown Tutor',
      studentId: sessionData.studentId,
      studentEmail: finalStudentEmail || 'unknown@example.com',
      studentName: finalStudentName || 'Unknown Student',
      courseId: sessionData.courseId || 'unknown',
      courseName: sessionData.courseName || 'Unknown Course',

      // Assignment details
      title,
      description: description || '',
      dueDate: dueDate || null,
      maxScore: maxScore || 100,

      // Submission
      submissionUrl: null,
      submittedAt: null,

      // Grading
      score: null,
      feedback: null,
      gradedAt: null,

      // Status
      status: 'pending', // 'pending', 'submitted', 'graded'

      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const assignmentsRef = collection(db, 'assignments');
    const assignmentDoc = await addDoc(assignmentsRef, assignmentData);

    console.log('✅ [ASSIGNMENTS POST] Assignment created:', assignmentDoc.id);

    // TODO: Send email notification to student
    // import { sendAssignmentCreatedEmail } from '@/lib/mail';
    // await sendAssignmentCreatedEmail(assignmentData);

    return NextResponse.json({
      success: true,
      assignmentId: assignmentDoc.id,
      message: 'Assignment created successfully'
    });

  } catch (error) {
    console.error('❌ [ASSIGNMENTS POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment', details: error.message },
      { status: 500 }
    );
  }
}