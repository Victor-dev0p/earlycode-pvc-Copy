import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorEmail = searchParams.get('email');
    const status = searchParams.get('status') || 'published';

    console.log('Fetching courses...');

    const coursesRef = collection(db, 'courses');
    
    // Simple query - just get published courses
    const q = query(coursesRef, where('status', '==', status));
    const querySnapshot = await getDocs(q);

    const courses = [];
    querySnapshot.forEach((doc) => {
      const courseData = doc.data();
      courses.push({
        id: doc.id,
        ...courseData,
      });
    });

    console.log(`✅ Found ${courses.length} courses`);

    // If tutorEmail provided, get already selected courses
    let selectedCourseIds = [];
    if (tutorEmail) {
      try {
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('email', '==', tutorEmail));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const tutorId = userSnapshot.docs[0].id;

          const tutorCoursesRef = collection(db, 'tutorCourses');
          const selectedQuery = query(
            tutorCoursesRef,
            where('tutorId', '==', tutorId)
          );
          const selectedSnapshot = await getDocs(selectedQuery);

          selectedSnapshot.forEach((doc) => {
            selectedCourseIds.push(doc.data().courseId);
          });
        }
      } catch (err) {
        console.log('Could not fetch selected courses:', err);
      }
    }

    return NextResponse.json({
      success: true,
      courses,
      selectedCourseIds,
    });
  } catch (error) {
    console.error('❌ Get courses error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch courses',
        details: error.message 
      },
      { status: 500 }
    );
  }
}