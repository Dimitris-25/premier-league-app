// src/utils/mailer.js
// Minimal mail sender. Falls back to console logging if SMTP is not configured.

const nodemailer = require("nodemailer");

function hasSmtpEnv() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
  );
}

/** Create a transporter or a stub logger if SMTP vars are missing. */
function getTransporter() {
  if (!hasSmtpEnv()) {
    return {
      sendMail: async (opts) => {
        // Dev fallback: log the message instead of sending
        /* eslint-disable no-console */
        console.warn("[MAIL DEV] SMTP not configured. Email would be:", opts);
        return { accepted: [opts.to], messageId: "dev-stub" };
      },
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

/** Send the actual password recovery email. */
async function sendPasswordRecoveryEmail({ to, token }) {
  const transporter = getTransporter();
  const appUrl = process.env.APP_URL || "http://localhost:3030";
  const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || "noreply@example.com",
    to,
    subject: "Password recovery",
    text: `Use the link to reset your password: ${resetLink}`,
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });

  return info;
}

module.exports = { sendPasswordRecoveryEmail };
