import 'server-only';

import { addHours } from 'date-fns';
import { createHash, randomBytes } from 'crypto';
import { Event, Pet } from '@/lib/types';
import { getSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

type ShareLinkRecord = {
  id: string;
  pet_id: string;
  owner_user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
};

export type SharedPetRecord = {
  pet: Pet;
  events: Event[];
  expiresAt: string;
};

function getShareLinkTtlHours() {
  const rawValue = process.env.SHARE_LINK_TTL_HOURS;
  const parsedValue = rawValue ? Number(rawValue) : NaN;

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return 24;
}

export function createShareToken() {
  return randomBytes(32).toString('hex');
}

export function hashShareToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createPetShareLink(ownerUserId: string, petId: string) {
  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data: ownedPet, error: petError } = await supabase
    .from('pets')
    .select('id')
    .eq('id', petId)
    .eq('user_id', ownerUserId)
    .maybeSingle();

  if (petError) {
    throw petError;
  }

  if (!ownedPet) {
    throw new Error('Forbidden');
  }

  const { error: revokeError } = await supabase
    .from('pet_share_links')
    .update({ revoked_at: nowIso })
    .eq('pet_id', petId)
    .eq('owner_user_id', ownerUserId)
    .is('revoked_at', null)
    .gt('expires_at', nowIso);

  if (revokeError) {
    throw revokeError;
  }

  const token = createShareToken();
  const expiresAt = addHours(new Date(), getShareLinkTtlHours()).toISOString();

  const { error: insertError } = await supabase.from('pet_share_links').insert({
    pet_id: petId,
    owner_user_id: ownerUserId,
    token_hash: hashShareToken(token),
    expires_at: expiresAt,
  });

  if (insertError) {
    throw insertError;
  }

  return {
    token,
    expiresAt,
  };
}

export async function getSharedPetByToken(token: string): Promise<SharedPetRecord | null> {
  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data: shareLink, error: shareLinkError } = await supabase
    .from('pet_share_links')
    .select('*')
    .eq('token_hash', hashShareToken(token))
    .is('revoked_at', null)
    .gt('expires_at', nowIso)
    .maybeSingle<ShareLinkRecord>();

  if (shareLinkError) {
    throw shareLinkError;
  }

  if (!shareLink) {
    return null;
  }

  const [{ data: pet, error: petError }, { data: events, error: eventsError }] = await Promise.all([
    supabase.from('pets').select('*').eq('id', shareLink.pet_id).maybeSingle<Pet>(),
    supabase
      .from('events')
      .select('*')
      .eq('pet_id', shareLink.pet_id)
      .order('event_date', { ascending: false })
      .returns<Event[]>(),
  ]);

  if (petError) {
    throw petError;
  }

  if (eventsError) {
    throw eventsError;
  }

  if (!pet) {
    return null;
  }

  return {
    pet,
    events: events ?? [],
    expiresAt: shareLink.expires_at,
  };
}
