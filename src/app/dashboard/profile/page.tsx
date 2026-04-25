import Link from 'next/link';
import { ArrowLeft, UserRound } from 'lucide-react';
import { redirect } from 'next/navigation';
import { TutorProfileForm } from '@/components/profile/TutorProfileForm';
import { Container } from '@/components/ui/Container';
import { createSupabaseServerClient } from '@/lib/server/supabase';

export default async function TutorProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const unavailableMessage =
    error?.code === '42P01'
      ? 'Falta aplicar la migracion de tutor_profiles en Supabase para activar este formulario.'
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50">
      <Container className="py-12">
        <Link
          href="/dashboard"
          className="group mb-8 inline-flex items-center text-base font-semibold text-gray-600 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Volver al dashboard
        </Link>

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
              <UserRound className="h-3.5 w-3.5 text-rose-500" />
              Tutor responsable
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
              Perfil del tutor
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-slate-600">
              Guarda tus datos principales para tener una ficha mas completa y preparada para próximos flujos de contacto.
            </p>
          </div>
        </div>

        <TutorProfileForm
          initialProfile={unavailableMessage ? null : profile}
          userEmail={user.email ?? ''}
          unavailableMessage={unavailableMessage}
        />
      </Container>
    </div>
  );
}
