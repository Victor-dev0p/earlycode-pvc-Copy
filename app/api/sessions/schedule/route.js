import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { sendSessionScheduledEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tutorId,
      tutorEmail,
      pairingId,
      sessionDate,
      duration,
      topic,
      googleMeetLink,
      // NEW: Curriculum tracking
      moduleId,
      sessionId,
      curriculumSession
    } = body;

    console.log('📚 [SESSIONS SCHEDULE] Creating session:', { tutorEmail, pairingId, sessionDate });

    // Validation
    if (!tutorId || !pairingId || !sessionDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get pairing details
    const pairingRef = doc(db, 'pairings', pairingId);
    const pairingSnap = await getDoc(pairingRef);

    if (!pairingSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Pairing not found' },
        { status: 404 }
      );
    }

    const pairing = pairingSnap.data();

    // Get tutor info
    const tutorRef = doc(db, 'users', tutorId);
    const tutorSnap = await getDoc(tutorRef);
    const tutorData = tutorSnap.exists() ? tutorSnap.data() : {};

    // Get student info
    const studentRef = doc(db, 'users', pairing.studentId);
    const studentSnap = await getDoc(studentRef);
    const studentData = studentSnap.exists() ? studentSnap.data() : {};

    // Parse datetime-local format to timestamp
    const scheduledStartTime = new Date(sessionDate).getTime();

    const sessionData = {
      // Pairing info
      pairingId,
      tutorId,
      tutorEmail: tutorData.email || tutorEmail,
      tutorName: tutorData.name || tutorData.email || 'Unknown Tutor',
      studentId: pairing.studentId,
      studentEmail: studentData.email || 'unknown@example.com',
      studentName: studentData.name || studentData.email || 'Unknown Student',
      courseId: pairing.courseId,
      courseName: pairing.courseName || 'Unknown Course',

      // Scheduling
      sessionDate,
      scheduledStartTime,
      duration: duration || 60,
      topic: topic || '',

      // Google Meet
      googleMeetLink: googleMeetLink || '',
      googleMeetSent: false,
      googleMeetSentAt: null,

      // NEW: Curriculum tracking
      moduleId: moduleId || null,
      sessionId: sessionId || null,
      curriculumSession: curriculumSession || null,

      // Status
      status: 'scheduled',

      // Completion fields
      tutorNotes: '',
      studentAttended: null,
      sessionCompletedAt: null,

      // Student feedback
      studentConfirmed: false,
      studentRating: null,
      studentReview: '',

      // Assignment
      assignmentId: null,
      assignmentScore: null,

      // Timestamps
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const sessionsRef = collection(db, 'sessions');
    const sessionDoc = await addDoc(sessionsRef, sessionData);

    console.log('✅ [SESSIONS SCHEDULE] Session created:', sessionDoc.id);

    // 📧 SEND EMAIL NOTIFICATION (NOW ACTIVE!)
    try {
      await sendSessionScheduledEmail(sessionData);
      console.log('✅ [SESSIONS SCHEDULE] Email sent to:', studentData.email);
      
      // Update session to mark email as sent
      await updateDoc(doc(db, 'sessions', sessionDoc.id), {
        googleMeetSent: true,
        googleMeetSentAt: Date.now()
      });
    } catch (emailError) {
      console.error('⚠️ [SESSIONS SCHEDULE] Email failed:', emailError.message);
      // Don't fail the request if email fails - session was still created
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionDoc.id,
      message: 'Session scheduled successfully'
    });

  } catch (error) {
    console.error('❌ [SESSIONS SCHEDULE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule session', details: error.message },
      { status: 500 }
    );
  }
}