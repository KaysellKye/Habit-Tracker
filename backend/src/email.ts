import nodemailer from 'nodemailer';

export interface SendOtpEmailParams {
  toEmail: string;
  otp: string;
  userName?: string;
  expiryMinutes?: number;
}

/**
 * Creates and returns a Nodemailer transporter based on environment variables.
 * Defaults to Gmail service if SMTP_HOST is not explicitly provided.
 */
export function getMailTransporter() {
  const user = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  // If custom SMTP host is defined (e.g., mail.example.com)
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT) || 587;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465 || process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }

  // Default to Gmail SMTP
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

/**
 * Send real 6-digit OTP verification email via SMTP
 */
export async function sendOtpEmail({
  toEmail,
  otp,
  userName = 'Pengguna',
  expiryMinutes = 5,
}: SendOtpEmailParams): Promise<{ success: boolean; messageId?: string }> {
  const transporter = getMailTransporter();
  const senderEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
  const senderName = process.env.SMTP_FROM_NAME || 'Habit Tracker';

  if (!transporter || !senderEmail) {
    throw new Error(
      'Konfigurasi SMTP belum lengkap. Mohon atur SMTP_EMAIL dan SMTP_PASSWORD (App Password) di file backend/.env.'
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kode OTP Pemulihan Kata Sandi</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); }
        .logo { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: #2563eb; color: #ffffff; border-radius: 12px; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
        h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0; }
        .otp-box { background: #eff6ff; border: 2px dashed #93c5fd; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'SF Mono', Consolas, Menlo, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #fef3c7; color: #b45309; margin-top: 8px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .alert-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #92400e; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⏰</div>
        <h1>Permintaan Pemulihan Kata Sandi</h1>
        <p>Halo <strong>${userName}</strong>,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun <strong>Habit Tracker</strong> Anda (${toEmail}). Gunakan kode verifikasi OTP berikut untuk melanjutkan proses:</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="badge">⏱ Berlaku selama ${expiryMinutes} Menit</div>
        </div>

        <div class="alert-warning">
          <strong>Penting:</strong> Jangan berikan kode OTP ini kepada siapa pun, termasuk pihak yang mengatasnamakan Habit Tracker.
        </div>

        <p>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini. Kata sandi akun Anda tetap aman dan tidak akan berubah tanpa kode verifikasi ini.</p>

        <div class="footer">
          <p>© 2026 Habit Tracker App • Calm & Productive Time Blocking</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Permintaan Pemulihan Kata Sandi - Habit Tracker

Halo ${userName},

Kode OTP verifikasi untuk mengatur ulang kata sandi akun Habit Tracker Anda adalah:

${otp}

Kode ini hanya berlaku selama ${expiryMinutes} menit.
Jangan bagikan kode ini kepada siapa pun. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.

© 2026 Habit Tracker
  `.trim();

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: toEmail,
    subject: `Kode OTP Pemulihan Kata Sandi: ${otp} - Habit Tracker`,
    text: textContent,
    html: htmlContent,
  });

  return { success: true, messageId: info.messageId };
}
