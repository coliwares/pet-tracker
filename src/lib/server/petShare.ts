import 'server-only';

import { addHours } from 'date-fns';
import { createHash, createHmac } from 'crypto';
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

function getShareLinkSecret() {
  return process.env.SHARE_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'pet-share-secret';
}

function getShareLinkTtlHours() {
  const rawValue = process.env.SHARE_LINK_TTL_HOURS;
  const parsedValue = rawValue ? Number(rawValue) : NaN;

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return 24;
}

export function createShareToken(linkId: string) {
  const signature = createHmac('sha256', getShareLinkSecret()).update(linkId).digest('hex');
  return `${linkId}.${signature}`;
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

  const { data: existingShareLink, error: existingShareLinkError } = await supabase
    .from('pet_share_links')
    .select('*')
    .eq('pet_id', petId)
    .eq('owner_user_id', ownerUserId)
    .is('revoked_at', null)
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: false })
    .maybeSingle<ShareLinkRecord>();

  if (existingShareLinkError) {
    throw existingShareLinkError;
  }

  if (existingShareLink) {
    return {
      token: createShareToken(existingShareLink.id),
      expiresAt: existingShareLink.expires_at,
    };
  }

  const expiresAt = addHours(new Date(), getShareLinkTtlHours()).toISOString();

  const { data: insertedShareLink, error: insertError } = await supabase
    .from('pet_share_links')
    .insert({
      pet_id: petId,
      owner_user_id: ownerUserId,
      token_hash: '',
      expires_at: expiresAt,
    })
    .select('*')
    .single<ShareLinkRecord>();

  if (insertError) {
    throw insertError;
  }

  const token = createShareToken(insertedShareLink.id);
  const { error: updateError } = await supabase
    .from('pet_share_links')
    .update({ token_hash: hashShareToken(token) })
    .eq('id', insertedShareLink.id);

  if (updateError) {
    throw updateError;
  }

  return {
    token,
    expiresAt,
  };
}

export async function getSharedPetByToken(token: string): Promise<SharedPetRecord | null> {
  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const [linkId, signature] = token.split('.');

  if (!linkId || !signature || createShareToken(linkId) !== token) {
    return null;
  }

  const { data: shareLink, error: shareLinkError } = await supabase
    .from('pet_share_links')
    .select('*')
    .eq('id', linkId)
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
