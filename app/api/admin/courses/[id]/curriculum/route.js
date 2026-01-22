import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// GET curriculum for a course
export async function GET(request, context) {
  try {
    console.log('=== GET curriculum START ===');
    
    // Await params for Next.js 15+
    const params = await context.params;
    const { id } = params;
    
    console.log('GET - Course ID:', id);
    
    const courseRef = doc(db, 'courses', id);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseData = courseSnap.data();
    const curriculum = courseData.curriculum || [];

    console.log('Curriculum fetched, length:', curriculum.length);
    return NextResponse.json({
      success: true,
      curriculum,
    });
  } catch (error) {
    console.error('Get curriculum error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum', details: error.message },
      { status: 500 }
    );
  }
}

// POST/PUT update curriculum for a course
export async function POST(request, context) {
  try {
    console.log('=== POST curriculum START ===');
    
    // Await params for Next.js 15+
    const params = await context.params;
    const { id } = params;
    
    console.log('Course ID:', id);

    const { curriculum } = await request.json();
    console.log('Curriculum received, length:', curriculum?.length);

    if (!curriculum || !Array.isArray(curriculum)) {
      return NextResponse.json(
        { error: 'Invalid curriculum data' },
        { status: 400 }
      );
    }

    // Remove undefined values by serializing/deserializing
    const cleanCurriculum = JSON.parse(JSON.stringify(curriculum));

    const courseRef = doc(db, 'courses', id);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    await updateDoc(courseRef, {
      curriculum: cleanCurriculum,
      updatedAt: new Date().getTime(),
    });

    console.log('Curriculum updated successfully');
    return NextResponse.json({
      success: true,
      message: 'Curriculum updated successfully',
    });
  } catch (error) {
    console.error('Update curriculum error:', error);
    console.error('Full error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update curriculum', details: error.message },
      { status: 500 }
    );
  }
}