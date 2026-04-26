import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { canUseGoogleAuth } from '@/lib/server/betaAccess';
import { getSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type PendingCookie = { name: string; value: string; options?: Record<string, unknown> };

function safeNextPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith('/')) {
    return '/dashboard';
  }

  return rawNext;
}

function buildLoginRedirect(request: NextRequest, error: string) {
  const url = new URL('/login', request.url);
  url.searchParams.set('error', error);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = safeNextPath(url.searchParams.get('next'));
  let cookiesToSet: PendingCookie[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(nextCookies) {
        cookiesToSet = nextCookies as PendingCookie[];
      },
    },
  });

  let error: Error | null = null;

  if (code) {
    const exchangeResult = await supabase.auth.exchangeCodeForSession(code);
    error = exchangeResult.error;
  } else if (
    tokenHash &&
    (type === 'invite' || type === 'recovery' || type === 'email')
  ) {
    const verifyResult = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    error = verifyResult.error;
  } else {
    return NextResponse.redirect(new URL('/login?error=validation', request.url), {
      status: 303,
    });
  }

  if (error) {
    return buildLoginRedirect(request, 'invite-link');
  }

  if (code) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return buildLoginRedirect(request, 'invite-link');
    }

    const providers = Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers : [];
    const isGoogleFlow =
      user.app_metadata?.provider === 'google' || providers.includes('google');

    if (isGoogleFlow) {
      const isAllowed = await canUseGoogleAuth(user);

      if (!isAllowed) {
        const adminSupabase = getSupabaseAdminClient();
        await supabase.auth.signOut();
        await adminSupabase.auth.admin.deleteUser(user.id);

        return buildLoginRedirect(request, 'google-beta-restricted');
      }
    }
  }

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
