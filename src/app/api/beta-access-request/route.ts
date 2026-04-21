import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/supabaseAdmin';
import { validateEmail } from '@/lib/utils';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;
const MIN_REASON_LENGTH = 20;
const MAX_REASON_LENGTH = 500;
const MIN_FORM_FILL_MS = 1500;

type BetaAccessRequestPayload = {
  name?: string;
  email?: string;
  reason?: string;
  source?: string;
  honeypot?: string;
  formLoadedAt?: number;
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return realIp?.trim() || 'unknown';
}

function buildIpHash(ip: string) {
  const salt = process.env.BETA_ACCESS_IP_SALT ?? 'pet-tracker-beta-access';
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}

function sanitizeText(value: string | undefined) {
  return value?.trim() ?? '';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BetaAccessRequestPayload;

    if (sanitizeText(body.honeypot) !== '') {
      return NextResponse.json({
        message: 'Solicitud enviada. Te contactaremos pronto.',
      });
    }

    const formLoadedAt = body.formLoadedAt ?? 0;
    if (!Number.isFinite(formLoadedAt) || Date.now() - formLoadedAt < MIN_FORM_FILL_MS) {
      return NextResponse.json({ error: 'Solicitud invalida' }, { status: 400 });
    }

    const name = sanitizeText(body.name);
    const email = sanitizeText(body.email).toLowerCase();
    const reason = sanitizeText(body.reason);
    const source = sanitizeText(body.source) || 'signup_closed';

    if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: 'Nombre invalido. Debe tener entre 2 y 80 caracteres.' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Email invalido.' }, { status: 400 });
    }

    if (reason.length < MIN_REASON_LENGTH || reason.length > MAX_REASON_LENGTH) {
      return NextResponse.json(
        { error: 'El motivo debe tener entre 20 y 500 caracteres.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const ipHash = buildIpHash(getClientIp(request));
    const userAgent = request.headers.get('user-agent')?.slice(0, 255) ?? null;
    const now = new Date().toISOString();

    const { data: existingRequest, error: existingError } = await supabase
      .from('beta_access_requests')
      .select('id, request_count')
      .eq('email_normalized', email)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingRequest) {
      const { error: updateError } = await supabase
        .from('beta_access_requests')
        .update({
          full_name: name,
          reason,
          source,
          ip_hash: ipHash,
          user_agent: userAgent,
          request_count: existingRequest.request_count + 1,
          last_requested_at: now,
          updated_at: now,
        })
        .eq('id', existingRequest.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase.from('beta_access_requests').insert({
        email,
        email_normalized: email,
        full_name: name,
        reason,
        source,
        ip_hash: ipHash,
        user_agent: userAgent,
        request_count: 1,
        last_requested_at: now,
      });

      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({
      message: 'Solicitud enviada. Te contactaremos cuando abramos nuevos cupos beta.',
    });
  } catch (error) {
    console.error('[beta-access-request] error:', error);
    return NextResponse.json(
      { error: 'No pudimos registrar la solicitud. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
