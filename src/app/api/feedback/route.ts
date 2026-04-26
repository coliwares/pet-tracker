import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/server/supabase';
import { validateFeedbackInput } from '@/lib/feedback';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const validation = validateFeedbackInput(body ?? {}, user.id);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        user_id: user.id,
        user_email: user.email.trim().toLowerCase(),
        status: 'nuevo',
        ...validation.data,
      },
    ])
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'No se pudo enviar el feedback.' }, { status: 500 });
  }

  return NextResponse.json({ feedback: data }, { status: 201 });
}
