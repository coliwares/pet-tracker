import { NextRequest, NextResponse } from 'next/server';
import { FEEDBACK_STATUSES, FEEDBACK_TYPES } from '@/lib/constants';
import { FeedbackStatus } from '@/lib/types';
import {
  getAuthenticatedUserFromToken,
  getSupabaseAdminClient,
  isFeedbackAdminEmail,
} from '@/lib/server/supabaseAdmin';

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

export async function GET(request: NextRequest) {
  try {
    await assertAdmin(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let query = getSupabaseAdminClient()
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (type && FEEDBACK_TYPES.includes(type as typeof FEEDBACK_TYPES[number])) {
      query = query.eq('type', type);
    }

    if (status && FEEDBACK_STATUSES.includes(status as typeof FEEDBACK_STATUSES[number])) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ feedback: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await assertAdmin(request);

    const body = (await request.json()) as {
      feedbackId?: string;
      status?: FeedbackStatus;
    };

    if (!body.feedbackId || !body.status) {
      return NextResponse.json(
        { error: 'feedbackId y status son requeridos' },
        { status: 400 }
      );
    }

    if (!FEEDBACK_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdminClient()
      .from('feedback')
      .update({ status: body.status })
      .eq('id', body.feedbackId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ feedback: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
