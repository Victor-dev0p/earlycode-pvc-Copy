import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { email, state, lga, phone, channel, userType } = await request.json();

    // Validate required fields
    if (!email || !state || !lga || !phone || !channel || channel === 'none') {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!/^[0-9]{10,11}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // User exists - return their data with role for proper redirect
      const userData = querySnapshot.docs[0].data();
      const userId = querySnapshot.docs[0].id;
      
      return NextResponse.json({
        success: true,
        exists: true,
        userId,
        role: userData.role || 'student',
        message: 'Welcome back! Redirecting to your dashboard...'
      });
    }

    // Determine role based on userType
    const role = userType === 'tutor' ? 'tutor' : 'student';

    // Create new user document in Firestore
    const userData = {
      email,
      state,
      lga,
      phone,
      channel,
      role,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      profileComplete: true,
      status: 'active'
    };

    // Add tutor-specific fields if role is tutor
    if (role === 'tutor') {
      userData.tutorStatus = 'pending_interview'; // pending_interview, interview_scheduled, passed, failed, active
      userData.interviewBooked = false;
      userData.interviewCompleted = false;
      userData.onboarded = false;
    }

    const docRef = await addDoc(usersRef, userData);

    return NextResponse.json({
      success: true,
      exists: false,
      userId: docRef.id,
      role,
      message: 'Profile completed successfully'
    });

  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}