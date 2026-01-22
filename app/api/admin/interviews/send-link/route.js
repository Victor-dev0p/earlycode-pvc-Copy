import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function POST(request) {
  try {
    const { interviewId } = await request.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const interviewRef = doc(db, 'interviews', interviewId);
    const interviewSnap = await getDoc(interviewRef);

    if (!interviewSnap.exists()) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const interview = interviewSnap.data();

    if (!interview.googleMeetLink) {
      return NextResponse.json(
        { error: 'Google Meet link not set for this interview' },
        { status: 400 }
      );
    }

    // Send email with Google Meet link
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: interview.tutorEmail,
      subject: 'Your PVC Tutor Interview is Scheduled! 🎓',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1E88E5 0%, #FFA726 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">PVC Interview Scheduled</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hi ${interview.tutorName},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Great news! Your tutor interview has been scheduled for <strong>${new Date(interview.interviewDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
            </p>

            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #1E88E5;">
              <h3 style="margin-top: 0; color: #1E88E5;">Interview Details</h3>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(interview.interviewDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong>Status:</strong> Scheduled</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${interview.googleMeetLink}" 
                 style="background: linear-gradient(135deg, #1E88E5 0%, #FFA726 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Join Interview via Google Meet
              </a>
            </div>

            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h4 style="margin-top: 0; color: #92400E;">📝 Interview Preparation Tips</h4>
              <ul style="color: #92400E; margin: 10px 0;">
                <li>Test your camera and microphone before the interview</li>
                <li>Find a quiet, well-lit space</li>
                <li>Be ready to discuss your teaching experience and expertise</li>
                <li>Prepare examples of how you've helped students learn</li>
                <li>Have questions ready about PVC's teaching platform</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
              If you have any questions, feel free to reply to this email or contact our support team.
            </p>

            <p style="font-size: 14px; color: #6B7280;">
              Best regards,<br/>
              <strong>The PVC Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update interview to mark email as sent
    await updateDoc(interviewRef, {
      googleMeetSent: true,
      googleMeetSentAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    return NextResponse.json({
      success: true,
      message: 'Interview link sent successfully',
    });
  } catch (error) {
    console.error('Send link error:', error);
    return NextResponse.json(
      { error: 'Failed to send interview link' },
      { status: 500 }
    );
  }
}