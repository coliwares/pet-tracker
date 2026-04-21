import { NextRequest, NextResponse } from 'next/server';
import { BETA_ACCESS_REQUEST_STATUSES } from '@/lib/constants';
import {
  getAuthenticatedUserFromToken,
  getSupabaseAdminClient,
  isFeedbackAdminEmail,
} from '@/lib/server/supabaseAdmin';
import { BetaAccessRequestStatus } from '@/lib/types';

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

function isExistingUserError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('already') ||
    normalized.includes('exists') ||
    normalized.includes('registered') ||
    normalized.includes('duplicate')
  );
}

export async function GET(request: NextRequest) {
  try {
    await assertAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let query = getSupabaseAdminClient()
      .from('beta_access_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (
      status &&
      BETA_ACCESS_REQUEST_STATUSES.includes(status as (typeof BETA_ACCESS_REQUEST_STATUSES)[number])
    ) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
    }

    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return NextResponse.json({ requests: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await assertAdmin(request);
    const body = (await request.json()) as {
      requestId?: string;
      action?: 'approve' | 'reject';
    };

    if (!body.requestId || (body.action !== 'approve' && body.action !== 'reject')) {
      return NextResponse.json(
        { error: 'requestId y action valido (approve/reject) son requeridos' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data: betaRequest, error: fetchError } = await supabase
      .from('beta_access_requests')
      .select('*')
      .eq('id', body.requestId)
      .single();

    if (fetchError || !betaRequest) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    if ((betaRequest.status as BetaAccessRequestStatus) === 'aprobado') {
      return NextResponse.json({ request: betaRequest });
    }

    if (body.action === 'reject') {
      const now = new Date().toISOString();
      const { data: rejectedRequest, error: rejectError } = await supabase
        .from('beta_access_requests')
        .update({
          status: 'rechazado',
          updated_at: now,
        })
        .eq('id', betaRequest.id)
        .select('*')
        .single();

      if (rejectError) {
        throw rejectError;
      }

      return NextResponse.json({ request: rejectedRequest });
    }

    const email = betaRequest.email_normalized;
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError && !isExistingUserError(inviteError.message)) {
      throw inviteError;
    }

    const now = new Date().toISOString();
    const { data: updatedRequest, error: updateError } = await supabase
      .from('beta_access_requests')
      .update({
        status: 'aprobado',
        approved_at: now,
        approved_by_email: adminUser.email?.trim().toLowerCase() ?? null,
        invited_at: now,
        updated_at: now,
      })
      .eq('id', betaRequest.id)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
