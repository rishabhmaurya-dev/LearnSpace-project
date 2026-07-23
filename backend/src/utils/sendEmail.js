import nodemailer from 'nodemailer';

export const sendResetLinkEmail = async (toEmail, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Apni Gmail ID
      pass: process.env.EMAIL_PASS  // Gmail App Password
    }
  });

  const mailOptions = {
    from: `"Security Team" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Password & PIN Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px;">
        <h2 style="color: #333;">Reset Your Password / PIN</h2>
        <p>You requested to reset your credentials. Click the button below to set a new password or security PIN:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Credentials</a>
        </div>
        <p style="color: #666; font-size: 13px;">This link is valid for <strong>15 minutes</strong> only.</p>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};