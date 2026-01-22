// lib/mail.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ==================== INTERVIEW EMAILS ====================

export const sendInterviewBookingEmail = async (tutorEmail, slotDate) => {
  await resend.emails.send({
    from: 'noreply@pvc.dev',
    to: tutorEmail,
    subject: 'Interview Scheduled',
    html: `
      <h2>Your Interview is Confirmed!</h2>
      <p>Dear Aspiring Tutor,</p>
      <p>Your interview has been scheduled for: <strong>${slotDate.toDateString()}</strong></p>
      <p>You will receive your Google Meet link shortly on your dashboard.</p>
      <p>Best regards,<br>PVC Team</p>
    `,
  });
};

export const sendGoogleMeetLink = async (tutorEmail, tutorName, meetUrl) => {
  await resend.emails.send({
    from: 'noreply@pvc.dev',
    to: tutorEmail,
    subject: 'Your Google Meet Link - Interview',
    html: `
      <h2>Google Meet Link</h2>
      <p>Hi ${tutorName},</p>
      <p>Here's your Google Meet link for your interview:</p>
      <p><a href="${meetUrl}" style="padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 5px;">
        Join Interview
      </a></p>
      <p>See you there!</p>
    `,
  });
};

export const sendPairingAcceptanceEmail = async (studentEmail, studentName, tutorName) => {
  await resend.emails.send({
    from: 'noreply@pvc.dev',
    to: studentEmail,
    subject: 'Your Tutor Has Been Assigned!',
    html: `
      <h2>Great News!</h2>
      <p>Hi ${studentName},</p>
      <p>Your tutor <strong>${tutorName}</strong> has accepted your course enrollment!</p>
      <p>Check your dashboard to get started.</p>
    `,
  });
};

export const sendOnboardingEmail = async (tutorEmail, tutorName, onboardingLink) => {
  await resend.emails.send({
    from: 'noreply@pvc.dev',
    to: tutorEmail,
    subject: 'Welcome to PVC - Onboarding Orientation',
    html: `
      <h2>Welcome to PVC!</h2>
      <p>Hi ${tutorName},</p>
      <p>Congratulations on passing your interview! 🎉</p>
      <p>Your onboarding orientation is ready:</p>
      <p><a href="${onboardingLink}" style="padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px;">
        Join Onboarding
      </a></p>
    `,
  });
};

// ==================== SESSION EMAILS ====================

/**
 * Send session scheduled email to student
 */
export const sendSessionScheduledEmail = async (session) => {
  try {
    await resend.emails.send({
      from: 'noreply@pvc.dev',
      to: session.studentEmail,
      subject: `Class Scheduled with ${session.tutorName} 📚`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Your Class Has Been Scheduled!</h2>
          
          <p>Hi ${session.studentName},</p>
          
          <p>Your tutor has scheduled a new class with you:</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>📚 Course:</strong> ${session.courseName}</p>
            <p style="margin: 10px 0;"><strong>👨‍🏫 Tutor:</strong> ${session.tutorName}</p>
            <p style="margin: 10px 0;"><strong>📖 Topic:</strong> ${session.topic}</p>
            <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${new Date(session.scheduledStartTime).toLocaleDateString()}</p>
            <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${new Date(session.scheduledStartTime).toLocaleTimeString()}</p>
            <p style="margin: 10px 0;"><strong>⏱️ Duration:</strong> ${session.duration} minutes</p>
          </div>
          
          ${session.googleMeetLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${session.googleMeetLink}" 
                 style="background: #10B981; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;
                        font-weight: bold;">
                📹 Join Class
              </a>
            </div>
          ` : ''}
          
          <p style="color: #6B7280; font-size: 14px;">
            You'll receive a reminder 15 minutes before the class starts.
          </p>
          
          <p>See you there!</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px;">
            The PVC Team<br>
            Professional Virtual Classroom
          </p>
        </div>
      `
    });
    
    console.log('✅ Session scheduled email sent to:', session.studentEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send session scheduled email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send session reminder email (15 mins before)
 */
export const sendSessionReminderEmail = async (session) => {
  try {
    await resend.emails.send({
      from: 'noreply@pvc.dev',
      to: session.studentEmail,
      subject: `⏰ Your class starts in 15 minutes!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #F59E0B;">Your Class Starts Soon!</h2>
          
          <p>Hi ${session.studentName},</p>
          
          <p>Your class with <strong>${session.tutorName}</strong> starts in <strong>15 minutes</strong>!</p>
          
          <div style="background: #FEF3C7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="margin: 10px 0;"><strong>📖 Topic:</strong> ${session.topic}</p>
            <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${new Date(session.scheduledStartTime).toLocaleTimeString()}</p>
          </div>
          
          ${session.googleMeetLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${session.googleMeetLink}" 
                 style="background: #10B981; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;
                        font-weight: bold; font-size: 16px;">
                📹 Join Meeting Now
              </a>
            </div>
          ` : ''}
          
          <p>See you in a few minutes!</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px;">
            The PVC Team
          </p>
        </div>
      `
    });
    
    console.log('✅ Session reminder sent to:', session.studentEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send session reminder:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send review request email to student (after session completed)
 */
export const sendReviewRequestEmail = async (session) => {
  try {
    await resend.emails.send({
      from: 'noreply@pvc.dev',
      to: session.studentEmail,
      subject: `Please rate your session with ${session.tutorName} ⭐`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8B5CF6;">How Was Your Session?</h2>
          
          <p>Hi ${session.studentName},</p>
          
          <p>Your session with <strong>${session.tutorName}</strong> has ended.</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>📖 Topic:</strong> ${session.topic}</p>
            <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${new Date(session.scheduledStartTime).toLocaleDateString()}</p>
          </div>
          
          <p>Please take a moment to rate your experience and help us improve!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pvc.dev'}/student/sessions" 
               style="background: #8B5CF6; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold;">
              ⭐ Rate Session
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">
            Your feedback helps us maintain high teaching standards.
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px;">
            The PVC Team
          </p>
        </div>
      `
    });
    
    console.log('✅ Review request sent to:', session.studentEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send review request:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send assignment created email to student
 */
export const sendAssignmentCreatedEmail = async (assignment) => {
  try {
    await resend.emails.send({
      from: 'noreply@pvc.dev',
      to: assignment.studentEmail,
      subject: `New Assignment: ${assignment.title} 📝`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3B82F6;">New Assignment Available!</h2>
          
          <p>Hi ${assignment.studentName},</p>
          
          <p>Your tutor <strong>${assignment.tutorName}</strong> has created a new assignment for you:</p>
          
          <div style="background: #EFF6FF; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3B82F6;">
            <h3 style="margin: 0 0 15px 0; color: #1E40AF;">${assignment.title}</h3>
            ${assignment.description ? `<p style="margin: 10px 0;">${assignment.description}</p>` : ''}
            ${assignment.dueDate ? `
              <p style="margin: 10px 0;"><strong>📅 Due:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
            ` : ''}
            <p style="margin: 10px 0;"><strong>📊 Max Score:</strong> ${assignment.maxScore}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pvc.dev'}/student/sessions" 
               style="background: #3B82F6; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold;">
              📝 View Assignment
            </a>
          </div>
          
          <p>Good luck with your assignment!</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px;">
            The PVC Team
          </p>
        </div>
      `
    });
    
    console.log('✅ Assignment created email sent to:', assignment.studentEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send assignment created email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send assignment graded email to student
 */
export const sendAssignmentGradedEmail = async (assignment) => {
  try {
    const percentage = (assignment.score / assignment.maxScore) * 100;
    const passed = percentage >= 60;
    
    await resend.emails.send({
      from: 'noreply@pvc.dev',
      to: assignment.studentEmail,
      subject: `Assignment Graded: ${assignment.title} ${passed ? '✅' : '📝'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: ${passed ? '#10B981' : '#F59E0B'};">Your Assignment Has Been Graded!</h2>
          
          <p>Hi ${assignment.studentName},</p>
          
          <p>Your tutor has graded your assignment:</p>
          
          <div style="background: ${passed ? '#D1FAE5' : '#FEF3C7'}; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${passed ? '#10B981' : '#F59E0B'};">
            <h3 style="margin: 0 0 15px 0; color: ${passed ? '#065F46' : '#92400E'};">${assignment.title}</h3>
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 48px; font-weight: bold; color: ${passed ? '#10B981' : '#F59E0B'};">
                ${assignment.score}/${assignment.maxScore}
              </div>
              <div style="font-size: 24px; color: ${passed ? '#065F46' : '#92400E'}; margin-top: 10px;">
                ${percentage.toFixed(0)}%
              </div>
            </div>
          </div>
          
          ${assignment.feedback ? `
            <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #374151;">Feedback from your tutor:</p>
              <p style="margin: 10px 0 0 0; color: #6B7280;">${assignment.feedback}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pvc.dev'}/student/sessions" 
               style="background: #6B7280; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold;">
              View Details
            </a>
          </div>
          
          <p>${passed ? 'Great job! Keep up the good work!' : 'Keep practicing - you\'re making progress!'}</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px;">
            The PVC Team
          </p>
        </div>
      `
    });
    
    console.log('✅ Assignment graded email sent to:', assignment.studentEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send assignment graded email:', error);
    return { success: false, error: error.message };
  }
};