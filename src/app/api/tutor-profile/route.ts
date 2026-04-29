import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/server/supabase';
import { validateTutorProfileInput } from '@/lib/tutorProfile';

function isMissingRelationError(error: { code?: string } | null) {
  return error?.code === '42P01';
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      return NextResponse.json(
        { error: 'La tabla de perfil del tutor aún no está creada.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'No se pudo cargar el perfil.' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const validation = validateTutorProfileInput(body ?? {});

  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const payload = {
    user_id: user.id,
    ...validation.data,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('tutor_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) {
    if (isMissingRelationError(error)) {
      return NextResponse.json(
        { error: 'La tabla de perfil del tutor aún no está creada.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'No se pudo guardar el perfil.' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
