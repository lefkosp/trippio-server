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
      html: `<p>Click to sign in to Trippio:</p><p><a href="${magicLink}">${magicLink}</a></p><p>This link expires in 15 minutes.</p>`,
    });
  } catch (err) {
    console.error('[email] Failed to send magic link email:', err);
  }
}

module.exports = { sendMagicLinkEmail };
