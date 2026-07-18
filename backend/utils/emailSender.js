const nodemailer = require('nodemailer');

/**
 * EMAIL SENDER UTILITY
 * 
 * Uses Gmail App Password — completely free, sends to ANY email
 * Works on Render because it uses SSL port 465 (not blocked)
 * 
 * SETUP:
 * 1. Go to myaccount.google.com
 * 2. Security → 2-Step Verification → turn ON
 * 3. Search "App Passwords" → Create → Copy 16-digit password
 * 4. Add to Render Environment Variables:
 *    GMAIL_USER = your_gmail@gmail.com
 *    GMAIL_APP_PASS = your16digitpassword
 */

const createTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;

  if (!user || !pass) {
    throw new Error(
      'GMAIL_USER and GMAIL_APP_PASS are not set in environment variables.'
    );
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: user.trim(), pass: pass.trim() },
    tls: { rejectUnauthorized: false },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const user = process.env.GMAIL_USER;
  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: `"FinSmart Finance" <${user.trim()}>`,
    to,
    subject,
    html,
  });

  console.log(`[Email] ✅ Sent to ${to} — Subject: ${subject}`);
};

module.exports = { sendEmail };
