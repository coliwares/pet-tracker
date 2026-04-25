'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { usePets } from '@/hooks/usePets';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { PetCard } from '@/components/pet/PetCard';
import { UpcomingVaccinesCard } from '@/components/home/UpcomingVaccinesCard';
import { UpcomingVisitsCard } from '@/components/home/UpcomingVisitsCard';
import { OnboardingPanel } from '@/components/onboarding/OnboardingPanel';
import { analytics } from '@/lib/analytics';
import { PawPrint, Plus, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { pets, loading: petsLoading } = usePets();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dismissStep, isDismissed, showStep } = useOnboardingState(user?.id);

  const firstPetStepId = 'dashboard-first-pet';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loginMethod = searchParams.get('login');

    if (!user || !loginMethod) {
      return;
    }

    analytics.login(loginMethod === 'demo');
    router.replace('/dashboard');
  }, [user, searchParams, router]);

  useEffect(() => {
    if (pets.length > 0) {
      showStep(firstPetStepId);
    }
  }, [pets.length, showStep]);

  if (authLoading || petsLoading) {
    return <Loading text="Cargando mascotas..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Container className="py-12">
        {pets.length === 0 && !isDismissed(firstPetStepId) ? (
          <div className="mb-4">
            <OnboardingPanel
              badge="Onboarding"
              title="Empecemos con tu primera mascota"
              description="Carga una mascota y luego registra su primer evento."
              progressLabel="Paso 1 de 3"
              icon={Sparkles}
              accentClassName="text-sky-700"
              surfaceClassName="border-sky-200 bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_100%)]"
              steps={[
                { label: 'Agrega tu primera mascota' },
                { label: 'Registra su primer evento medico' },
                { label: 'Comparte el carnet cuando lo necesites' },
              ]}
              primaryActionLabel="Agregar mascota"
              primaryActionHref="/dashboard/new-pet"
              secondaryActionLabel="Ver demo guiada"
              secondaryActionHref="/login?demo=true"
              dismissLabel="Saltar"
              onDismiss={() => dismissStep(firstPetStepId)}
            />
          </div>
        ) : null}

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent">
              Mis Mascotas
            </h1>
            <p className="text-lg text-gray-600">
              {pets.length === 0
                ? 'Comienza agregando tu primera mascota'
                : `${pets.length} ${pets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}`}
            </p>
          </div>
          <Link href="/dashboard/new-pet">
            <Button size="lg" className="shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Nueva Mascota
            </Button>
          </Link>
        </div>

        <UpcomingVaccinesCard />
        <UpcomingVisitsCard />

        {pets.length === 0 ? (
          <div className="space-y-6">
            <div className="rounded-3xl border-2 border-gray-100 bg-white p-12 shadow-card">
              <EmptyState
                icon={
                  <div className="rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 p-6 shadow-xl">
                    <PawPrint className="h-20 w-20 text-white" />
                  </div>
                }
                title="No tienes mascotas registradas"
                description="Agrega tu primera mascota para empezar a gestionar su historial medico, vacunas y visitas veterinarias"
                actionLabel="Agregar mi primera mascota"
                onAction={() => router.push('/dashboard/new-pet')}
              />
            </div>
          </div>
        ) : (
          <div className="grid animate-fade-in gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
