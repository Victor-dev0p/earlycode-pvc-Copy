import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate a unique token (you should store this in your DB with expiry)
    const token = crypto.randomUUID();
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;


    // Send magic link email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Sign in to PVC',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Sign in to your account</h2>
              <p>Click the button below to sign in to your PVC account. This link will expire in 15 minutes.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLinkUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block;
                          font-weight: bold;">
                  Sign In to PVC
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you didn't request this email, you can safely ignore it.
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <span style="color: #667eea; word-break: break-all;">${magicLinkUrl}</span>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Magic link sent successfully' 
    });

  } catch (error) {
    console.error('Send magic link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}