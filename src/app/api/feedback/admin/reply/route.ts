import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUserFromToken,
  getSupabaseAdminClient,
  isFeedbackAdminEmail,
} from '@/lib/server/supabaseAdmin';
import { sendFeedbackReplyEmail } from '@/lib/server/resend';

function getTokenFromRequest(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  return authorization.slice('Bearer '.length);
}

async function assertAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const user = await getAuthenticatedUserFromToken(token);

  if (!isFeedbackAdminEmail(user.email)) {
    throw new Error('Forbidden');
  }

  return user;
}

function getFeedbackEmailTagValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await assertAdmin(request);
    const body = (await request.json()) as {
      feedbackId?: string;
      subject?: string;
      html?: string;
      text?: string;
    };

    if (!body.feedbackId || !body.subject || !body.html || !body.text) {
      return NextResponse.json(
        { error: 'feedbackId, subject, html y text son requeridos' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('id, title, type, user_email')
      .eq('id', body.feedbackId)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json({ error: 'Feedback no encontrado' }, { status: 404 });
    }

    const resendId = await sendFeedbackReplyEmail({
      to: feedback.user_email,
      subject: body.subject,
      html: body.html,
      text: body.text,
      tags: [
        { name: 'channel', value: 'feedback-admin' },
        { name: 'feedback_type', value: getFeedbackEmailTagValue(feedback.type) },
        { name: 'feedback_id', value: getFeedbackEmailTagValue(feedback.id) },
      ],
    });

    return NextResponse.json({
      ok: true,
      resendId,
      sentTo: feedback.user_email,
      approvedBy: adminUser.email?.trim().toLowerCase() ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status =
      message === 'Forbidden'
        ? 403
        : message === 'Unauthorized'
          ? 401
          : message.startsWith('Missing required environment variable')
            ? 500
            : message.startsWith('Resend error:')
              ? 502
              : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
