import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// Performance thresholds
const TIER_THRESHOLDS = {
  TIER_1: { min: 0, max: 69, students: 1 },
  TIER_2: { min: 70, max: 84, students: 3 },
  TIER_3: { min: 85, max: 100, students: 6 }
};

export async function POST(request) {
  try {
    const { tutorId } = await request.json();

    if (!tutorId) {
      return NextResponse.json(
        { error: 'Tutor ID required' },
        { status: 400 }
      );
    }

    console.log('📊 Calculating performance for tutor:', tutorId);

    // Get all active pairings for this tutor
    const pairingsRef = collection(db, 'pairings');
    const pairingsQuery = query(
      pairingsRef,
      where('tutorId', '==', tutorId),
      where('status', 'in', ['accepted', 'active'])
    );
    const pairingsSnap = await getDocs(pairingsQuery);

    if (pairingsSnap.empty) {
      console.log('⚠️ No active pairings found');
      return NextResponse.json({
        success: true,
        performanceScore: 0,
        tier: 1,
        message: 'No pairings to calculate performance'
      });
    }

    let totalAttendance = 0;
    let totalAssignmentScore = 0;
    let totalExamScore = 0;
    let totalReviewScore = 0;
    let count = 0;

    // Calculate metrics for each pairing
    for (const pairingDoc of pairingsSnap.docs) {
      const pairing = pairingDoc.data();

      // Get sessions for this pairing
      const sessionsRef = collection(db, 'sessions');
      const sessionsQuery = query(
        sessionsRef,
        where('pairingId', '==', pairingDoc.id)
      );
      const sessionsSnap = await getDocs(sessionsQuery);

      if (!sessionsSnap.empty) {
        let attended = 0;
        let total = 0;

        sessionsSnap.forEach(sessionDoc => {
          const session = sessionDoc.data();
          total++;
          if (session.tutorAttended) attended++;
        });

        const attendanceRate = total > 0 ? (attended / total) * 100 : 0;
        totalAttendance += attendanceRate;
        count++;
      }

      // Get student's assignment scores
      if (pairing.studentId) {
        const assignmentsRef = collection(db, 'assignments');
        const assignmentsQuery = query(
          assignmentsRef,
          where('studentId', '==', pairing.studentId),
          where('courseId', '==', pairing.courseId)
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);

        if (!assignmentsSnap.empty) {
          let totalScore = 0;
          let assignmentCount = 0;

          assignmentsSnap.forEach(assignmentDoc => {
            const assignment = assignmentDoc.data();
            if (assignment.score !== undefined) {
              totalScore += assignment.score;
              assignmentCount++;
            }
          });

          if (assignmentCount > 0) {
            totalAssignmentScore += totalScore / assignmentCount;
          }
        }

        // Get student's exam scores
        const examsRef = collection(db, 'exams');
        const examsQuery = query(
          examsRef,
          where('studentId', '==', pairing.studentId),
          where('courseId', '==', pairing.courseId)
        );
        const examsSnap = await getDocs(examsQuery);

        if (!examsSnap.empty) {
          let totalScore = 0;
          let examCount = 0;

          examsSnap.forEach(examDoc => {
            const exam = examDoc.data();
            if (exam.score !== undefined) {
              totalScore += exam.score;
              examCount++;
            }
          });

          if (examCount > 0) {
            totalExamScore += totalScore / examCount;
          }
        }

        // Get student's reviews
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(
          reviewsRef,
          where('tutorId', '==', tutorId),
          where('studentId', '==', pairing.studentId)
        );
        const reviewsSnap = await getDocs(reviewsQuery);

        if (!reviewsSnap.empty) {
          let totalRating = 0;
          let reviewCount = 0;

          reviewsSnap.forEach(reviewDoc => {
            const review = reviewDoc.data();
            if (review.rating !== undefined) {
              totalRating += review.rating;
              reviewCount++;
            }
          });

          if (reviewCount > 0) {
            // Convert 5-star rating to percentage
            totalReviewScore += (totalRating / reviewCount / 5) * 100;
          }
        }
      }
    }

    // Calculate weighted performance score
    const avgAttendance = count > 0 ? totalAttendance / count : 0;
    const avgAssignment = count > 0 ? totalAssignmentScore / count : 0;
    const avgExam = count > 0 ? totalExamScore / count : 0;
    const avgReview = count > 0 ? totalReviewScore / count : 0;

    // Weights: Attendance 30%, Assignments 25%, Exams 25%, Reviews 20%
    const performanceScore = (
      (avgAttendance * 0.30) +
      (avgAssignment * 0.25) +
      (avgExam * 0.25) +
      (avgReview * 0.20)
    );

    console.log('📊 Performance metrics:', {
      attendance: avgAttendance.toFixed(2),
      assignments: avgAssignment.toFixed(2),
      exams: avgExam.toFixed(2),
      reviews: avgReview.toFixed(2),
      finalScore: performanceScore.toFixed(2)
    });

    // Determine tier
    let newTier = 1;
    let maxStudents = 1;

    if (performanceScore >= TIER_THRESHOLDS.TIER_3.min) {
      newTier = 3;
      maxStudents = 6;
    } else if (performanceScore >= TIER_THRESHOLDS.TIER_2.min) {
      newTier = 2;
      maxStudents = 3;
    }

    // Update tutor record
    const tutorRef = doc(db, 'users', tutorId);
    await updateDoc(tutorRef, {
      performanceScore: Math.round(performanceScore * 100) / 100,
      pairingTier: newTier,
      maxConcurrentStudents: maxStudents,
      lastPerformanceUpdate: Date.now(),
      performanceMetrics: {
        attendance: Math.round(avgAttendance * 100) / 100,
        assignments: Math.round(avgAssignment * 100) / 100,
        exams: Math.round(avgExam * 100) / 100,
        reviews: Math.round(avgReview * 100) / 100
      },
      updatedAt: Date.now()
    });

    console.log(`✅ Updated to Tier ${newTier} (max ${maxStudents} students)`);

    return NextResponse.json({
      success: true,
      performanceScore: Math.round(performanceScore * 100) / 100,
      tier: newTier,
      maxStudents,
      metrics: {
        attendance: Math.round(avgAttendance * 100) / 100,
        assignments: Math.round(avgAssignment * 100) / 100,
        exams: Math.round(avgExam * 100) / 100,
        reviews: Math.round(avgReview * 100) / 100
      }
    });
  } catch (error) {
    console.error('❌ Performance calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate performance', details: error.message },
      { status: 500 }
    );
  }
}