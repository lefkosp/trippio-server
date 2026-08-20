const env = require('../config/env');

let resendClient = null;
if (env.resendApiKey) {
  const { Resend } = require('resend');
  resendClient = new Resend(env.resendApiKey);
}

async function sendMagicLinkEmail({ to, magicLink }) {
  if (!resendClient) {
    console.log(`[email] RESEND_API_KEY not set — skipping send. Magic link for ${to}: ${magicLink}`);
    return;
  }

  try {
    await resendClient.emails.send({
      from: env.emailFrom,
      to,
      subject: 'Sign in to Trippio',
      html: `<p>Hi,</p><p>Someone requested a sign-in link for the Trippio account <strong>${to}</strong>. Click below to sign in:</p><p><a href="${magicLink}">${magicLink}</a></p><p>This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p><p>— Trippio</p>`,
      text: `Hi,\n\nSomeone requested a sign-in link for the Trippio account ${to}. Use the link below to sign in:\n\n${magicLink}\n\nThis link expires in 15 minutes. If you didn't request this, you can safely ignore this email.\n\n— Trippio`,
    });
  } catch (err) {
    console.error('[email] Failed to send magic link email:', err);
  }
}

module.exports = { sendMagicLinkEmail };
