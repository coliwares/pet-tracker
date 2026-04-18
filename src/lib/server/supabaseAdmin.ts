import 'server-only';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const feedbackAdminEmail = process.env.FEEDBACK_ADMIN_EMAIL?.trim().toLowerCase();

function assertEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseServerClient() {
  return createClient(
    assertEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    assertEnv(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
  );
}

export function getSupabaseAdminClient() {
  return createClient(
    assertEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    assertEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function getAuthenticatedUserFromToken(token: string) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export function isFeedbackAdminEmail(email: string | undefined | null) {
  if (!email || !feedbackAdminEmail) {
    return false;
  }

  return email.trim().toLowerCase() === feedbackAdminEmail;
}
