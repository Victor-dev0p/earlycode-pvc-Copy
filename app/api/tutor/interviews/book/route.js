import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { tutorEmail, tutorName, slotId, interviewDate } = await request.json();

    console.log('📝 Interview booking request:', { tutorEmail, slotId });

    if (!tutorEmail || !slotId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get tutor
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', tutorEmail));
    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      return NextResponse.json(
        { success: false, error: 'Tutor not found' },
        { status: 404 }
      );
    }

    const tutorDoc = userSnap.docs[0];
    const tutorId = tutorDoc.id;
    const tutorData = tutorDoc.data();

    console.log('✅ Tutor found:', tutorId);

    // 🎯 VALIDATION: Check if tutor has selected at least one course
    const tutorCoursesRef = collection(db, 'tutorCourses');
    const coursesQuery = query(tutorCoursesRef, where('tutorId', '==', tutorId));
    const coursesSnap = await getDocs(coursesQuery);

    if (coursesSnap.empty) {
      console.log('❌ No courses selected');
      return NextResponse.json(
        { 
          success: false, 
          error: 'You must select at least one course before booking an interview',
          code: 'NO_COURSES_SELECTED'
        },
        { status: 400 }
      );
    }

    console.log(`✅ Tutor has ${coursesSnap.size} course(s) selected`);

    // Check existing booking
    const interviewsRef = collection(db, 'interviews');
    const existingQuery = query(interviewsRef, where('tutorEmail', '==', tutorEmail));
    const existing = await getDocs(existingQuery);

    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: 'You have already booked an interview' },
        { status: 409 }
      );
    }

    // Verify slot
    const slotRef = doc(db, 'interviewSlots', slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Interview slot not found' },
        { status: 404 }
      );
    }

    const slotData = slotSnap.data();

    if (slotData.bookedCount >= slotData.capacity) {
      return NextResponse.json(
        { success: false, error: 'This slot is fully booked' },
        { status: 409 }
      );
    }

    if (slotData.dateTimestamp < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Cannot book a past slot' },
        { status: 400 }
      );
    }

    // Create booking
    const interviewData = {
      tutorId,
      tutorEmail,
      tutorName: tutorName || tutorData.name || tutorEmail.split('@')[0],
      slotId,
      interviewDate: slotData.date,
      status: 'pending',
      googleMeetLink: '',
      googleMeetSent: false,
      interviewNotes: '',
      onboardingSent: false,
      onboardingLink: '',
      bookedAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await addDoc(interviewsRef, interviewData);

    console.log('✅ Interview booked:', docRef.id);

    // Update slot
    await updateDoc(slotRef, {
      bookedCount: increment(1),
      updatedAt: Date.now()
    });

    // Check if full
    const updated = await getDoc(slotRef);
    if (updated.data().bookedCount >= updated.data().capacity) {
      await updateDoc(slotRef, { status: 'full' });
    }

    // Update tutor status
    await updateDoc(doc(db, 'users', tutorId), {
      interviewBooked: true,
      interviewId: docRef.id,
      tutorStatus: 'interview_scheduled',
      updatedAt: Date.now()
    });

    console.log('✅ Tutor status updated');

    return NextResponse.json({
      success: true,
      interviewId: docRef.id,
      message: 'Interview booked successfully'
    });
  } catch (error) {
    console.error('❌ Book interview error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to book interview', details: error.message },
      { status: 500 }
    );
  }
}