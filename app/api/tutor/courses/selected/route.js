import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, getDoc, doc } from 'firebase/firestore';

// GET - Fetch tutor's selected courses WITH FULL DETAILS
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorEmail = searchParams.get('tutorEmail');

    console.log('📥 GET selected courses - tutorEmail:', tutorEmail);

    if (!tutorEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing tutorEmail parameter' },
        { status: 400 }
      );
    }

    // Get tutor ID
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', tutorEmail));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Tutor not found' },
        { status: 404 }
      );
    }

    const tutorId = userSnapshot.docs[0].id;
    console.log('✅ Tutor ID:', tutorId);

    // Get selected courses with full details
    const tutorCoursesRef = collection(db, 'tutorCourses');
    const selectedQuery = query(tutorCoursesRef, where('tutorId', '==', tutorId));
    const selectedSnapshot = await getDocs(selectedQuery);

    // Build full course data
    const tutorCourses = [];
    
    for (const docSnap of selectedSnapshot.docs) {
      const courseData = docSnap.data();
      tutorCourses.push({
        id: docSnap.id,
        ...courseData
      });
    }

    const selectedCourseIds = tutorCourses.map(tc => tc.courseId);

    console.log('✅ Found courses:', {
      total: tutorCourses.length,
      courseIds: selectedCourseIds
    });

    return NextResponse.json({
      success: true,
      tutorCourses,        // Full course details with payment/interview status
      selectedCourseIds,   // Just the IDs for the select-courses page
      count: tutorCourses.length
    });

  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch selected courses',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Select a new course
export async function POST(request) {
  try {
    const body = await request.json();
    const { tutorEmail, courseId } = body;

    console.log('📥 POST request:', { tutorEmail, courseId });

    if (!tutorEmail || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tutorEmail and courseId' },
        { status: 400 }
      );
    }

    // Get tutor ID
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', tutorEmail));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Tutor account not found' },
        { status: 404 }
      );
    }

    const tutorDoc = userSnapshot.docs[0];
    const tutorId = tutorDoc.id;
    console.log('✅ Tutor found:', tutorId);

    // Check if already selected
    const tutorCoursesRef = collection(db, 'tutorCourses');
    const existingQuery = query(
      tutorCoursesRef,
      where('tutorId', '==', tutorId),
      where('courseId', '==', courseId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'You have already selected this course' },
        { status: 409 }
      );
    }

    // Get course details
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseData = courseSnap.data();
    console.log('✅ Course found:', courseData.title);

    // Count existing selections
    const allSelectionsQuery = query(tutorCoursesRef, where('tutorId', '==', tutorId));
    const allSelections = await getDocs(allSelectionsQuery);
    const selectionOrder = allSelections.size + 1;

    console.log('📊 This is course selection #', selectionOrder);

    // Determine if payment required
    const isFirstCourse = selectionOrder === 1;
    const paymentRequired = !isFirstCourse;
    const paymentAmount = paymentRequired ? 5000 : 0;

    // Create tutor-course selection
    const tutorCourseData = {
      tutorId,
      tutorEmail,
      courseId,
      courseName: courseData.title || 'Untitled Course',
      selectionOrder,
      paymentRequired,
      paymentStatus: paymentRequired ? 'pending' : 'not_required',
      paymentAmount,
      paymentReference: '',
      interviewStatus: 'pending',
      interviewId: '',
      selectedAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
    };

    const docRef = await addDoc(tutorCoursesRef, tutorCourseData);

    console.log('✅ Course selected successfully:', docRef.id);

    const responseMessage = isFirstCourse
      ? 'First course selected successfully! (FREE)'
      : 'Course selected. Please complete payment to proceed.';

    return NextResponse.json({
      success: true,
      tutorCourseId: docRef.id,
      paymentRequired,
      paymentAmount,
      isFirstCourse,
      message: responseMessage,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to select course',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
