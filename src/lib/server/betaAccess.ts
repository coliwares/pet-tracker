import 'server-only';

import { User } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from './supabaseAdmin';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hasEmailIdentity(user: User) {
  if (user.app_metadata?.provider === 'email') {
    return true;
  }

  const providers = Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers : [];
  if (providers.includes('email')) {
    return true;
  }

  return user.identities?.some((identity) => identity.provider === 'email') ?? false;
}

export async function isApprovedBetaEmail(email: string) {
  const supabase = getSupabaseAdminClient();
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabase
    .from('beta_access_requests')
    .select('id')
    .eq('email_normalized', normalizedEmail)
    .eq('status', 'aprobado')
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function canUseGoogleAuth(user: User) {
  const email = user.email ? normalizeEmail(user.email) : '';

  if (!email) {
    return false;
  }

  if (await isApprovedBetaEmail(email)) {
    return true;
  }

  return hasEmailIdentity(user);
}
