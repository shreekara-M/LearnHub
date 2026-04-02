const { Resend } = require('resend');

const { AppError } = require('@middleware/errorHandler');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'LearnHub <noreply@learnhub.dev>';

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendOtpEmail(to, otp, name) {
  const safeName = name ? escapeHtml(name) : 'there';
  const html = `
    <div style="background:#f3f6fb;padding:32px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 10px 28px rgba(15,23,42,0.08);">
        <div style="background:linear-gradient(135deg,#1d4ed8,#4338ca);padding:20px 24px;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">LearnHub Verification</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Use this one-time verification code to continue your LearnHub registration:</p>
          <div style="text-align:center;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px;margin:0 0 14px;">
            <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#1e3a8a;">${otp}</span>
          </div>
          <p style="margin:0 0 8px;font-size:14px;color:#334155;">This code expires in 10 minutes.</p>
          <p style="margin:0;font-size:13px;color:#64748b;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your LearnHub verification code',
      html
    });

    if (result.error) {
      throw new AppError('Unable to send verification email.', 502, 'EMAIL_SEND_FAILED');
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Unable to send verification email.', 502, 'EMAIL_SEND_FAILED');
  }
}

module.exports = {
  FROM_EMAIL,
  sendOtpEmail
};