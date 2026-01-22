import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// GET single course
export async function GET(request, context) {
  try {
    console.log('=== GET /api/admin/courses/[id] START ===');
    
    // Await params for Next.js 15+
    const params = await context.params;
    const { id } = params;
    
    console.log('GET - Course ID:', id);
    
    const courseRef = doc(db, 'courses', id);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      console.log('Course not found');
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    console.log('Course found successfully');
    return NextResponse.json({
      success: true,
      course: {
        id: courseSnap.id,
        ...courseSnap.data(),
      },
    });
  } catch (error) {
    console.error('=== GET /api/admin/courses/[id] ERROR ===');
    console.error('Get course error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { error: 'Failed to fetch course', details: error.message },
      { status: 500 }
    );
  }
}

// PUT update course
export async function PUT(request, context) {
  try {
    console.log('=== PUT /api/admin/courses/[id] START ===');
    
    // Await params for Next.js 15+
    const params = await context.params;
    const { id } = params;
    
    console.log('PUT - Course ID:', id);
    
    const updates = await request.json();
    console.log('Updates:', Object.keys(updates));

    // Remove id from updates if present
    delete updates.id;
    delete updates.createdAt;

    // Add updated timestamp
    updates.updatedAt = new Date().getTime();

    const courseRef = doc(db, 'courses', id);
    await updateDoc(courseRef, updates);

    console.log('Course updated successfully');
    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
    });
  } catch (error) {
    console.error('=== PUT /api/admin/courses/[id] ERROR ===');
    console.error('Update course error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update course', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE course
export async function DELETE(request, context) {
  try {
    console.log('=== DELETE /api/admin/courses/[id] START ===');
    
    // Await params for Next.js 15+
    const params = await context.params;
    const { id } = params;
    
    console.log('DELETE - Course ID:', id);
    
    const courseRef = doc(db, 'courses', id);
    
    // Check if course exists
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    await deleteDoc(courseRef);

    console.log('Course deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('=== DELETE /api/admin/courses/[id] ERROR ===');
    console.error('Delete course error:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete course', details: error.message },
      { status: 500 }
    );
  }
}