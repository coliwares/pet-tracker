import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
type PendingCookie = { name: string; value: string; options?: Record<string, unknown> };

function buildRedirect(
  request: NextRequest,
  path: string,
  cookiesToSet: PendingCookie[],
  error?: 'invalid-credentials' | 'validation'
) {
  const url = new URL(path, request.url);

  if (error) {
    url.searchParams.set('error', error);
  }

  const response = NextResponse.redirect(url, { status: 303 });

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  let cookiesToSet: PendingCookie[] = [];

  if (!email || !password || password.length < 6) {
    return buildRedirect(request, '/login', cookiesToSet, 'validation');
  }

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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return buildRedirect(request, '/login', cookiesToSet, 'invalid-credentials');
  }

  return buildRedirect(request, '/dashboard', cookiesToSet);
}
