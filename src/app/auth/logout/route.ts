import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
type PendingCookie = { name: string; value: string; options?: Record<string, unknown> };

export async function GET(request: NextRequest) {
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

  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL('/', request.url), { status: 303 });

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
