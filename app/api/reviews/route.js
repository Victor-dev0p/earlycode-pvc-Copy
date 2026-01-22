import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';

// GET - Fetch reviews
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    const studentId = searchParams.get('studentId');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const limitCount = searchParams.get('limit');

    console.log('📊 Fetching reviews with filters:', { tutorId, studentId, minRating, maxRating });

    const sessionsRef = collection(db, 'sessions');
    let q;

    // Build query based on filters
    if (tutorId) {
      q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        where('studentRating', '!=', null),
        orderBy('studentRating', 'desc'),
        orderBy('sessionDate', 'desc')
      );
    } else if (studentId) {
      q = query(
        sessionsRef,
        where('studentId', '==', studentId),
        where('studentRating', '!=', null),
        orderBy('studentRating', 'desc'),
        orderBy('sessionDate', 'desc')
      );
    } else {
      // All reviews
      q = query(
        sessionsRef,
        where('studentRating', '!=', null),
        orderBy('sessionDate', 'desc')
      );
    }

    if (limitCount) {
      q = query(q, limit(parseInt(limitCount)));
    }

    const snapshot = await getDocs(q);

    let reviews = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sessionId: doc.id,
        tutorId: data.tutorId,
        studentId: data.studentId,
        courseId: data.courseId,
        sessionDate: data.sessionDate,
        topic: data.topic,
        rating: data.studentRating,
        review: data.studentReview,
        assignmentScore: data.assignmentScore,
        examScore: data.examScore,
        studentAttended: data.studentAttended,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    // Apply rating filters (post-query filtering)
    if (minRating) {
      reviews = reviews.filter(r => r.rating >= parseInt(minRating));
    }
    if (maxRating) {
      reviews = reviews.filter(r => r.rating <= parseInt(maxRating));
    }

    console.log(`✅ Found ${reviews.length} reviews`);

    // Calculate statistics
    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };

    return NextResponse.json({
      success: true,
      reviews,
      stats
    });
  } catch (error) {
    console.error('❌ Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Admin can manually add a review/note to a session
export async function POST(request) {
  try {
    const { sessionId, adminNotes, flagged, flagReason } = await request.json();

    console.log('🚩 Admin reviewing session:', sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const updateData = {
      adminNotes: adminNotes || '',
      flagged: flagged || false,
      flagReason: flagReason || '',
      adminReviewedAt: Date.now(),
      updatedAt: Date.now()
    };

    await updateDoc(sessionRef, updateData);

    console.log('✅ Admin review added');

    return NextResponse.json({
      success: true,
      message: 'Admin review added successfully'
    });
  } catch (error) {
    console.error('❌ Admin review error:', error);
    return NextResponse.json(
      { error: 'Failed to add admin review', details: error.message },
      { status: 500 }
    );
  }
}