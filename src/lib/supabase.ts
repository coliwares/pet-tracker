import { createClient } from '@supabase/supabase-js';
import { Pet, Event, Feedback, FeedbackStatus } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Fetches
export async function getPets(userId: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPet(petId: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single();
  if (error) throw error;
  return data;
}

export async function createPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('pets')
    .insert([pet])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePet(petId: string, updates: Partial<Pet>) {
  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', petId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePet(petId: string) {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId);
  if (error) throw error;
}

export async function getEvents(petId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('pet_id', petId)
    .order('event_date', { ascending: false });
  if (error) throw error;
  return data;
}

async function archivePreviousVaccineEvents(event: Event) {
  if (event.type !== 'vacuna') {
    return;
  }

  const normalizedTitle = event.title.trim();
  if (!normalizedTitle) {
    return;
  }

  const { error } = await supabase
    .from('events')
    .update({
      next_due_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq('pet_id', event.pet_id)
    .eq('type', 'vacuna')
    .ilike('title', normalizedTitle)
    .lte('event_date', event.event_date)
    .not('next_due_date', 'is', null)
    .neq('id', event.id);

  if (error) throw error;
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();
  if (error) throw error;

  await archivePreviousVaccineEvents(data);
  return data;
}

export async function updateEvent(eventId: string, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);
  if (error) throw error;
}

export async function getFeedback(userId: string) {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Feedback[];
}

export async function createFeedback(
  feedback: Omit<Feedback, 'id' | 'status' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert([{ ...feedback, status: 'nuevo' }])
    .select()
    .single();
  if (error) throw error;
  return data as Feedback;
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const token = data.session?.access_token;
  if (!token) {
    throw new Error('Sesión no disponible');
  }

  return token;
}

export async function getAllFeedback(filters?: {
  type?: string;
  status?: string;
}) {
  const token = await getAccessToken();
  const params = new URLSearchParams();

  if (filters?.type && filters.type !== 'all') {
    params.set('type', filters.type);
  }

  if (filters?.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  const query = params.toString();
  const response = await fetch(`/api/feedback/admin${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'No se pudo obtener el feedback global');
  }

  const payload = (await response.json()) as { feedback: Feedback[] };
  return payload.feedback;
}

export async function updateFeedbackStatus(feedbackId: string, status: FeedbackStatus) {
  const token = await getAccessToken();
  const response = await fetch('/api/feedback/admin', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ feedbackId, status }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'No se pudo actualizar el estado');
  }

  const payload = (await response.json()) as { feedback: Feedback };
  return payload.feedback;
}

export async function getFeedbackAdminStatus() {
  const token = await getAccessToken();
  const response = await fetch('/api/feedback/admin/status', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { isAdmin: false };
  }

  return (await response.json()) as { isAdmin: boolean };
}

// Storage
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
