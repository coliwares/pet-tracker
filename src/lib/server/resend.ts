import 'server-only';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const feedbackAdminEmail = process.env.FEEDBACK_ADMIN_EMAIL;

function assertEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  tags?: Array<{
    name: string;
    value: string;
  }>;
}

export async function sendFeedbackReplyEmail({
  to,
  subject,
  html,
  text,
  tags = [],
}: SendEmailInput) {
  const apiKey = assertEnv(resendApiKey, 'RESEND_API_KEY');
  const from = assertEnv(
    resendFromEmail,
    'RESEND_FROM_EMAIL'
  );

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'pet-tracker-feedback-admin/1.0',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
      replyTo: feedbackAdminEmail ? [feedbackAdminEmail] : undefined,
      tags,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        id?: string;
        message?: string;
        name?: string;
      }
    | null;

  if (!response.ok) {
    const details = payload?.message ?? payload?.name ?? 'Unknown Resend error';
    throw new Error(`Resend error: ${details}`);
  }

  if (!payload?.id) {
    throw new Error('Resend error: missing email id');
  }

  return payload.id;
}
