import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function POST(request) {
  try {
    const { onboardingLink } = await request.json();

    if (!onboardingLink) {
      return NextResponse.json(
        { error: 'Onboarding link is required' },
        { status: 400 }
      );
    }

    // Get all passed interviews that haven't been sent onboarding
    const interviewsRef = collection(db, 'interviews');
    const q = query(
      interviewsRef,
      where('status', '==', 'passed'),
      where('onboardingSent', '==', false)
    );
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'No tutors ready for onboarding' },
        { status: 404 }
      );
    }

    const emailPromises = [];
    const updatePromises = [];

    snapshot.forEach(docSnap => {
      const interview = docSnap.data();
      
      // Send onboarding email
      emailPromises.push(
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: interview.tutorEmail,
          subject: '🎉 Welcome to PVC - Complete Your Onboarding',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
              </div>
              
              <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
                <p style="font-size: 18px; color: #374151;">Hi ${interview.tutorName},</p>
                
                <p style="font-size: 16px; color: #374151;">
                  Great news! You've <strong>passed your tutor interview</strong> and are now ready to join the PVC teaching team! 🎓
                </p>

                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10B981;">
                  <h3 style="margin-top: 0; color: #10B981;">Next Steps</h3>
                  <ol style="color: #374151; line-height: 1.8;">
                    <li>Complete your onboarding process</li>
                    <li>Set up your teaching profile</li>
                    <li>Get paired with students</li>
                    <li>Start teaching and earning!</li>
                  </ol>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${onboardingLink}" 
                     style="background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Complete Onboarding
                  </a>
                </div>

                <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                  <p style="color: #92400E; margin: 0;">
                    <strong>⏰ Important:</strong> Please complete your onboarding within 48 hours to start receiving student pairings.
                  </p>
                </div>

                <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
                  Need help? Reply to this email or contact our support team.
                </p>

                <p style="font-size: 14px; color: #6B7280;">
                  Best regards,<br/>
                  <strong>The PVC Team</strong>
                </p>
              </div>
            </div>
          `,
        })
      );

      // Mark as onboarding sent
      updatePromises.push(
        updateDoc(doc(db, 'interviews', docSnap.id), {
          onboardingSent: true,
          onboardingSentAt: Date.now(),
          onboardingLink,
          updatedAt: Date.now()
        })
      );
    });

    await Promise.all([...emailPromises, ...updatePromises]);

    return NextResponse.json({
      success: true,
      count: snapshot.size,
      message: `Onboarding sent to ${snapshot.size} tutor(s)`
    });
  } catch (error) {
    console.error('Onboarding send error:', error);
    return NextResponse.json(
      { error: 'Failed to send onboarding', details: error.message },
      { status: 500 }
    );
  }
}
