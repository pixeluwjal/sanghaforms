// lib/email.ts - Gmail specific version
import nodemailer from 'nodemailer';

// For Gmail, you might need to use OAuth2 or App Passwords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use App Password for Gmail
  },
});

export async function sendInvitationEmail(
  email: string, 
  invitationLink: string, 
  role: string
) {
  try {
    await transporter.verify();
    console.log('SMTP configuration is valid');

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Invitation to Join FormBuilder Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #7C3AED; margin: 0;">FormBuilder Admin Invitation</h2>
          </div>
          <p>Hello,</p>
          <p>You have been invited to join FormBuilder as an <strong>${role.replace('_', ' ')}</strong>.</p>
          <p>Click the button below to set up your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" 
               style="background-color: #7C3AED; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
              Setup Account
            </a>
          </div>
          <p style="color: #ef4444; font-size: 14px;">
            <strong>Note:</strong> This invitation link expires in 24 hours.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Invitation email sent to:', email);
    return result;
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}