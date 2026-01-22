import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

// GET single interview
export async function GET(request, { params }) {
  try {
    // Next.js 15+ requires awaiting params
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const interviewRef = doc(db, 'interviews', id);
    const interviewSnap = await getDoc(interviewRef);

    if (!interviewSnap.exists()) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      interview: {
        id: interviewSnap.id,
        ...interviewSnap.data(),
      },
    });
  } catch (error) {
    console.error('Get interview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview', details: error.message },
      { status: 500 }
    );
  }
}

// PUT update interview
export async function PUT(request, { params }) {
  try {
    // Next.js 15+ requires awaiting params
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    console.log('📝 PUT interview update - ID:', id);

    const updates = await request.json();
    console.log('Updates received:', updates);

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.tutorId;
    delete updates.tutorEmail;
    delete updates.bookedAt;

    // Add updated timestamp
    updates.updatedAt = Date.now();

    const interviewRef = doc(db, 'interviews', id);
    
    // Check if interview exists
    const interviewSnap = await getDoc(interviewRef);
    if (!interviewSnap.exists()) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const interviewData = interviewSnap.data();
    console.log('Current interview data:', interviewData);

    // Update interview document
    await updateDoc(interviewRef, updates);
    console.log('✅ Interview document updated');

    // Handle status changes
    if (updates.status === 'passed') {
      console.log('🎓 Interview PASSED - Updating related records + Adding Pairing Fields');
      
      try {
        // Update tutor's course records
        const tutorCoursesRef = collection(db, 'tutorCourses');
        const coursesQuery = query(
          tutorCoursesRef, 
          where('tutorId', '==', interviewData.tutorId)
        );
        const coursesSnap = await getDocs(coursesQuery);

        console.log(`Found ${coursesSnap.size} courses for tutor ${interviewData.tutorId}`);

        // Update all courses to passed
        const updatePromises = [];
        coursesSnap.forEach((courseDoc) => {
          console.log('Updating course:', courseDoc.id);
          updatePromises.push(
            updateDoc(courseDoc.ref, {
              interviewStatus: 'passed',
              updatedAt: Date.now()
            })
          );
        });

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
          console.log(`✅ Updated ${updatePromises.length} course records to PASSED`);
        }

        // 🎯 UPDATE USER WITH PAIRING FIELDS - THIS IS THE FIX!
        const userRef = doc(db, 'users', interviewData.tutorId);
        const userDoc = await getDoc(userRef);
        const currentUserData = userDoc.data();
        
        // Prepare the update data
        const userUpdate = {
          // Status fields
          tutorStatus: 'active',  // Changed from 'passed' to 'active'
          interviewCompleted: true,
          onboardingCompleted: true,  // Mark onboarding as complete
          onboarded: true,  // Also set this flag
          
          // 🎯 PAIRING FIELDS - These were missing!
          pairingTier: 1,
          maxConcurrentStudents: 1,
          currentStudentCount: 0,
          totalStudentsPaired: 0,
          performanceScore: 0,
          
          updatedAt: Date.now(),
        };
        
        await updateDoc(userRef, userUpdate);
        
        console.log('✅ User status updated to ACTIVE with ALL pairing fields:', {
          tutorStatus: 'active',
          onboardingCompleted: true,
          pairingTier: 1,
          maxConcurrentStudents: 1,
          currentStudentCount: 0,
          totalStudentsPaired: 0,
          performanceScore: 0
        });

      } catch (updateError) {
        console.error('Error updating related records:', updateError);
        // Don't fail the main update if related updates fail
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update tutor records',
            details: updateError.message 
          },
          { status: 500 }
        );
      }

    } else if (updates.status === 'failed') {
      console.log('❌ Interview FAILED - Updating user status');
      
      try {
        // Update user status to failed
        const userRef = doc(db, 'users', interviewData.tutorId);
        await updateDoc(userRef, {
          tutorStatus: 'failed',
          interviewCompleted: true,
          updatedAt: Date.now(),
        });
        console.log('✅ User status updated to FAILED');

      } catch (updateError) {
        console.error('Error updating user status:', updateError);
      }

    } else if (updates.status === 'completed') {
      console.log('✓ Interview marked as COMPLETED');
      
      try {
        // Update user status
        const userRef = doc(db, 'users', interviewData.tutorId);
        await updateDoc(userRef, {
          tutorStatus: 'interview_completed',
          interviewCompleted: true,
          updatedAt: Date.now(),
        });
        console.log('✅ User status updated to COMPLETED');

      } catch (updateError) {
        console.error('Error updating user status:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Interview updated successfully',
    });

  } catch (error) {
    console.error('❌ Update interview error:', error);
    return NextResponse.json(
      { error: 'Failed to update interview', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE interview (cancel)
export async function DELETE(request, { params }) {
  try {
    // Next.js 15+ requires awaiting params
    const resolvedParams = await params;
    const { id } = resolvedParams;

    console.log('🗑️ DELETE interview - ID:', id);

    const interviewRef = doc(db, 'interviews', id);
    
    // Check if interview exists
    const interviewSnap = await getDoc(interviewRef);
    if (!interviewSnap.exists()) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const interviewData = interviewSnap.data();

    // Update slot's booked count (decrement)
    const slotRef = doc(db, 'interviewSlots', interviewData.slotId);
    const slotSnap = await getDoc(slotRef);
    
    if (slotSnap.exists()) {
      const slotData = slotSnap.data();
      await updateDoc(slotRef, {
        bookedCount: Math.max(0, slotData.bookedCount - 1),
        status: 'open',
        updatedAt: Date.now(),
      });
      console.log('✅ Slot booking count decremented');
    }

    // Update user status
    const userRef = doc(db, 'users', interviewData.tutorId);
    await updateDoc(userRef, {
      tutorStatus: 'pending_interview',
      interviewBooked: false,
      updatedAt: Date.now(),
    });
    console.log('✅ User status reset');

    // Delete interview
    await deleteDoc(interviewRef);
    console.log('✅ Interview deleted');

    return NextResponse.json({
      success: true,
      message: 'Interview cancelled successfully',
    });

  } catch (error) {
    console.error('❌ Delete interview error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel interview', details: error.message },
      { status: 500 }
    );
  }
}