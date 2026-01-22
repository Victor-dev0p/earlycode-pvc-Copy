import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// GET - Fetch sessions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    const studentId = searchParams.get('studentId');
    const pairingId = searchParams.get('pairingId');
    const all = searchParams.get('all'); // New parameter for admin

    console.log('📚 [SESSIONS GET] Fetching sessions:', { tutorId, studentId, pairingId, all });

    const sessionsRef = collection(db, 'sessions');
    let q;

    // Admin can fetch all sessions (without orderBy to avoid index)
    if (all === 'true') {
      q = query(sessionsRef, limit(1000)); // Limit to prevent large reads
    } else if (tutorId) {
      // Simple query without orderBy
      q = query(sessionsRef, where('tutorId', '==', tutorId));
    } else if (studentId) {
      // Simple query without orderBy
      q = query(sessionsRef, where('studentId', '==', studentId));
    } else if (pairingId) {
      // Simple query without orderBy
      q = query(sessionsRef, where('pairingId', '==', pairingId));
    } else {
      console.log('❌ [SESSIONS GET] No filter provided');
      return NextResponse.json(
        { success: false, error: 'tutorId, studentId, pairingId, or all=true required' },
        { status: 400 }
      );
    }

    const snapshot = await getDocs(q);

    let sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort in memory by scheduledStartTime (newest first)
    sessions.sort((a, b) => (b.scheduledStartTime || 0) - (a.scheduledStartTime || 0));

    console.log(`✅ [SESSIONS GET] Found ${sessions.length} sessions`);
    
    // Log if we have any reviewed sessions
    const reviewedCount = sessions.filter(s => s.studentRating > 0).length;
    console.log(`📊 [SESSIONS GET] ${reviewedCount} sessions with reviews`);

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('❌ [SESSIONS GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create session (Schedule)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tutorId,
      tutorEmail,
      tutorName,
      studentId,
      studentEmail,
      studentName,
      pairingId,
      courseId,
      courseName,
      sessionDate,
      duration,
      topic,
      googleMeetLink
    } = body;

    console.log('📚 [SESSIONS POST] Creating session:', { tutorEmail, studentEmail, sessionDate });

    // Validation
    if (!tutorId || !studentId || !pairingId || !courseId || !sessionDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse datetime-local format to timestamp
    const scheduledStartTime = new Date(sessionDate).getTime();

    const sessionData = {
      // Pairing info
      pairingId,
      tutorId,
      tutorEmail,
      tutorName,
      studentId,
      studentEmail,
      studentName,
      courseId,
      courseName,

      // Scheduling
      sessionDate,
      scheduledStartTime,
      duration: duration || 60,
      topic: topic || '',

      // Google Meet
      googleMeetLink: googleMeetLink || '',
      googleMeetSent: false,
      googleMeetSentAt: null,

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

    console.log('✅ [SESSIONS POST] Session created:', sessionDoc.id);

    // TODO: Send email notification
    // import { sendSessionScheduledEmail } from '@/lib/mail';
    // await sendSessionScheduledEmail(sessionData);

    return NextResponse.json({
      success: true,
      sessionId: sessionDoc.id,
      message: 'Session scheduled successfully'
    });

  } catch (error) {
    console.error('❌ [SESSIONS POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session', details: error.message },
      { status: 500 }
    );
  }
}