import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

const TIER_LIMITS = {
  1: 1,  // 1 concurrent student
  2: 3,  // 3 concurrent students
  3: 6   // 6 concurrent students
};

// POST - Manually update tutor tier (Admin override)
export async function POST(request) {
  try {
    const { tutorId, newTier, reason, adminEmail } = await request.json();

    console.log('🔧 Manual tier update request:', { tutorId, newTier, adminEmail });

    // Validation
    if (!tutorId || !newTier) {
      return NextResponse.json(
        { error: 'Tutor ID and new tier required' },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(newTier)) {
      return NextResponse.json(
        { error: 'Tier must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    // Get current tutor data
    const tutorRef = doc(db, 'users', tutorId);
    const tutorSnap = await getDoc(tutorRef);

    if (!tutorSnap.exists()) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    const tutorData = tutorSnap.data();
    const oldTier = tutorData.pairingTier || 1;
    const oldMaxStudents = tutorData.maxConcurrentStudents || 1;
    const currentStudentCount = tutorData.currentStudentCount || 0;
    const newMaxStudents = TIER_LIMITS[newTier];

    console.log('📊 Current state:', {
      oldTier,
      oldMaxStudents,
      currentStudentCount
    });

    // Safety check: Can't downgrade if it would violate current student count
    if (newMaxStudents < currentStudentCount) {
      return NextResponse.json({
        error: `Cannot downgrade to Tier ${newTier}. Tutor currently has ${currentStudentCount} students, but Tier ${newTier} only allows ${newMaxStudents}. Please reassign students first.`,
        canDowngrade: false,
        currentStudentCount,
        newMaxStudents
      }, { status: 400 });
    }

    // Update tutor document
    const updateData = {
      pairingTier: newTier,
      maxConcurrentStudents: newMaxStudents,
      manualTierOverride: true,
      tierOverrideReason: reason || 'Admin manual adjustment',
      tierOverrideBy: adminEmail || 'admin',
      tierOverrideAt: Date.now(),
      lastTierUpdate: Date.now(),
      updatedAt: Date.now()
    };

    await updateDoc(tutorRef, updateData);

    console.log('✅ Tier manually updated:', {
      oldTier,
      newTier,
      oldMaxStudents,
      newMaxStudents
    });

    // Create audit log entry
    const auditData = {
      type: 'tier_manual_update',
      tutorId,
      tutorEmail: tutorData.email,
      oldTier,
      newTier,
      oldMaxStudents,
      newMaxStudents,
      reason: reason || 'No reason provided',
      adminEmail: adminEmail || 'admin',
      performanceScore: tutorData.performanceScore || 0,
      timestamp: Date.now()
    };

    // Save audit log
    await addDoc(collection(db, 'auditLogs'), auditData);

    return NextResponse.json({
      success: true,
      message: `Tier manually updated from ${oldTier} to ${newTier}`,
      oldTier,
      newTier,
      oldMaxStudents,
      newMaxStudents,
      currentStudentCount,
      warning: newMaxStudents < oldMaxStudents 
        ? 'Max students decreased. Monitor for capacity issues.' 
        : null
    });
  } catch (error) {
    console.error('❌ Manual tier update error:', error);
    return NextResponse.json(
      { error: 'Failed to update tier', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get tier update history for a tutor
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');

    if (!tutorId) {
      return NextResponse.json(
        { error: 'Tutor ID required' },
        { status: 400 }
      );
    }

    // Get audit logs
    const auditRef = collection(db, 'auditLogs');
    const q = query(
      auditRef,
      where('tutorId', '==', tutorId),
      where('type', '==', 'tier_manual_update'),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('❌ Get tier history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier history', details: error.message },
      { status: 500 }
    );
  }
}