import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const sendResetLinkEmail = async (toEmail, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Apni Gmail ID
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  const mailOptions = {
    from: `"Security Team" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password & PIN Reset Request",
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
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ============================================================
// NOTIFY ADMIN WHEN A COMPANY SUBMITS FOR VERIFICATION
// ============================================================

export const sendCompanyVerificationRequestEmail = async (
  adminEmail,
  companyData,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const adminUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const mailOptions = {
    from: `"SkillForge Platform" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Company Verification Request: ${companyData.companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 520px;">
        <h2 style="color: #333;">New Company Verification Request</h2>
        <p>A company has submitted their profile for review. Please verify the uploaded documents and approve/reject their account.</p>

        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Company:</strong> ${companyData.companyName || "—"}</p>
          <p style="margin: 6px 0;"><strong>Industry:</strong> ${companyData.industryType || "—"}</p>
          <p style="margin: 6px 0;"><strong>Registration No:</strong> ${companyData.registrationNo || "—"}</p>
          <p style="margin: 6px 0;"><strong>Contact:</strong> ${companyData.contactPersonName || "—"} (${companyData.contactPersonEmail || "—"})</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${adminUrl}/admin/companies" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Review Company</a>
        </div>

        <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated notification from the SkillForge platform.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
