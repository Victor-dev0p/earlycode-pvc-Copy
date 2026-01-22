import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function GET(request) {
  try {
    const tutorCoursesRef = collection(db, 'tutorCourses');
    const q = query(tutorCoursesRef, orderBy('selectedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);

    const tutorCourses = [];
    querySnapshot.forEach((doc) => {
      tutorCourses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json({
      success: true,
      tutorCourses,
    });
  } catch (error) {
    console.error('Get tutor courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutor courses' },
      { status: 500 }
    );
  }
}