import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

// Performance thresholds
const TIER_THRESHOLDS = {
  TIER_1: { min: 0, max: 69, students: 1 },
  TIER_2: { min: 70, max: 84, students: 3 },
  TIER_3: { min: 85, max: 100, students: 6 }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { tutorId, tutorEmail } = body;

    // ✅ FIX #1: Accept either tutorId OR tutorEmail
    let finalTutorId = tutorId;

    if (!finalTutorId && tutorEmail) {
      console.log('📧 [PERFORMANCE] Looking up tutor by email:', tutorEmail);
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', tutorEmail));
      const userSnap = await getDocs(userQuery);
      
      if (userSnap.empty) {
        return NextResponse.json(
          { success: false, error: 'Tutor not found' },
          { status: 404 }
        );
      }
      
      finalTutorId = userSnap.docs[0].id;
    }

    if (!finalTutorId) {
      return NextResponse.json(
        { success: false, error: 'Tutor ID or email required' },
        { status: 400 }
      );
    }

    console.log('📊 [PERFORMANCE] Calculating for tutor:', finalTutorId);

    // Get all completed sessions for this tutor
    const sessionsRef = collection(db, 'sessions');
    const sessionsQuery = query(
      sessionsRef,
      where('tutorId', '==', finalTutorId),
      where('status', '==', 'completed')
    );
    const sessionsSnap = await getDocs(sessionsQuery);

    if (sessionsSnap.empty) {
      console.log('⚠️ [PERFORMANCE] No completed sessions found');
      
      // ✅ FIX #3: Update both tier AND pairingTier fields
      const tutorRef = doc(db, 'users', finalTutorId);
      await updateDoc(tutorRef, {
        performanceScore: 0,
        pairingTier: 1,
        tier: 1,
        maxConcurrentStudents: 1,
        lastPerformanceUpdate: Date.now(),
        updatedAt: Date.now()
      });
      
      return NextResponse.json({
        success: true,
        performanceScore: 0,
        tier: 1,
        maxStudents: 1,
        message: 'No completed sessions to calculate performance'
      });
    }

    let totalSessions = 0;
    let attendedSessions = 0;
    let totalRatings = 0;
    let ratingSum = 0;

    // Calculate attendance and ratings from sessions
    sessionsSnap.forEach(doc => {
      const session = doc.data();
      totalSessions++;

      // Attendance (tutor marks this)
      if (session.studentAttended === true) {
        attendedSessions++;
      }

      // Ratings (student gives this)
      if (session.studentRating && session.studentRating > 0) {
        ratingSum += session.studentRating;
        totalRatings++;
      }
    });

    // Get all assignments for this tutor
    const assignmentsRef = collection(db, 'assignments');
    const assignmentsQuery = query(
      assignmentsRef,
      where('tutorId', '==', finalTutorId),
      where('status', '==', 'graded')
    );
    const assignmentsSnap = await getDocs(assignmentsQuery);

    let totalAssignments = 0;
    let assignmentScoreSum = 0;

    assignmentsSnap.forEach(doc => {
      const assignment = doc.data();
      if (assignment.score !== undefined && assignment.maxScore) {
        const percentage = (assignment.score / assignment.maxScore) * 100;
        assignmentScoreSum += percentage;
        totalAssignments++;
      }
    });

    // Calculate metrics
    const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;
    const avgAssignmentScore = totalAssignments > 0 ? assignmentScoreSum / totalAssignments : 0;
    const avgRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
    const ratingPercentage = (avgRating / 5) * 100;

    console.log('📊 [PERFORMANCE] Metrics:', {
      totalSessions,
      attendedSessions,
      attendanceRate: attendanceRate.toFixed(2),
      totalAssignments,
      avgAssignmentScore: avgAssignmentScore.toFixed(2),
      totalRatings,
      avgRating: avgRating.toFixed(2),
      ratingPercentage: ratingPercentage.toFixed(2)
    });

    // ✅ FIX #2: Require minimum data before tier promotion
    // Must have at least 3 sessions AND at least 1 graded assignment
    const hasMinimumData = totalSessions >= 3 && totalAssignments >= 1;

    // Calculate weighted performance score
    // Weights: Attendance 30%, Assignments 30%, Ratings 40%
    const performanceScore = (
      (attendanceRate * 0.30) +
      (avgAssignmentScore * 0.30) +
      (ratingPercentage * 0.40)
    );

    console.log('🎯 [PERFORMANCE] Final Score:', performanceScore.toFixed(2));
    console.log('📋 [PERFORMANCE] Has minimum data?', hasMinimumData, 
      `(${totalSessions} sessions, ${totalAssignments} assignments)`);

    // Determine tier with stricter requirements
    let newTier = 1;
    let maxStudents = 1;

    if (!hasMinimumData) {
      // ✅ FIX #2: Not enough data - keep at Tier 1
      newTier = 1;
      maxStudents = 1;
      console.log('⚠️ [PERFORMANCE] Insufficient data - staying at Tier 1');
    } else if (performanceScore >= TIER_THRESHOLDS.TIER_3.min) {
      newTier = 3;
      maxStudents = 6;
    } else if (performanceScore >= TIER_THRESHOLDS.TIER_2.min) {
      newTier = 2;
      maxStudents = 3;
    }

    // ✅ FIX #3: Update BOTH tier fields so dashboard shows it
    const tutorRef = doc(db, 'users', finalTutorId);
    const updateData = {
      performanceScore: Math.round(performanceScore * 100) / 100,
      pairingTier: newTier,
      tier: newTier, // Dashboard uses this
      maxConcurrentStudents: maxStudents,
      lastPerformanceUpdate: Date.now(),
      performanceMetrics: {
        attendance: Math.round(attendanceRate * 100) / 100,
        assignments: Math.round(avgAssignmentScore * 100) / 100,
        reviews: Math.round(ratingPercentage * 100) / 100,
        totalSessions,
        totalRatings,
        totalAssignments,
        hasMinimumData
      },
      updatedAt: Date.now()
    };

    await updateDoc(tutorRef, updateData);

    console.log(`✅ [PERFORMANCE] Updated to Tier ${newTier} (max ${maxStudents} students)`);

    return NextResponse.json({
      success: true,
      performanceScore: Math.round(performanceScore * 100) / 100,
      tier: newTier,
      maxStudents,
      hasMinimumData,
      metrics: {
        attendance: Math.round(attendanceRate * 100) / 100,
        assignments: Math.round(avgAssignmentScore * 100) / 100,
        reviews: Math.round(ratingPercentage * 100) / 100,
        avgRating: Math.round(avgRating * 100) / 100,
        totalSessions,
        totalRatings,
        totalAssignments
      },
      message: hasMinimumData 
        ? `Performance calculated: ${performanceScore.toFixed(2)} (Tier ${newTier})`
        : `Insufficient data (need 3+ sessions and 1+ assignment). Staying at Tier 1.`
    });

  } catch (error) {
    console.error('❌ [PERFORMANCE] Calculation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate performance', details: error.message },
      { status: 500 }
    );
  }
}