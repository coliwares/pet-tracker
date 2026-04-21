import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type PendingCookie = { name: string; value: string; options?: Record<string, unknown> };

function safeNextPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith('/')) {
    return '/dashboard';
  }

  return rawNext;
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
    return NextResponse.redirect(
      new URL('/login?error=invite-link', request.url),
      {
        status: 303,
      }
    );
  }

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
