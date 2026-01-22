import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

// GET all courses
export async function GET(request) {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST create new course
export async function POST(request) {
  try {
    const {
      title,
      description,
      photoUrl,
      price,
      durationMonths,
      frequencyDaysPerWeek,
      sessionLengthHours,
      format,
      award,
      learningObjectives,
      marketOpportunities,
      faqs,
      adminEmail,
    } = await request.json();

    // Validate required fields
    if (!title || !description || !price || !durationMonths || !frequencyDaysPerWeek || !sessionLengthHours) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create course document
    const courseData = {
      title,
      description,
      photoUrl: photoUrl || '',
      price: parseFloat(price),
      durationMonths: parseInt(durationMonths),
      frequencyDaysPerWeek: parseInt(frequencyDaysPerWeek),
      sessionLengthHours: parseFloat(sessionLengthHours),
      format: format || 'online',
      award: award || '',
      learningObjectives: learningObjectives || [],
      marketOpportunities: marketOpportunities || [],
      faqs: faqs || [],
      adminEmail: adminEmail || '',
      status: 'draft', // draft, published, archived
      enrollmentCount: 0,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    const coursesRef = collection(db, 'courses');
    const docRef = await addDoc(coursesRef, courseData);

    return NextResponse.json({
      success: true,
      courseId: docRef.id,
      message: 'Course created successfully',
    });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}