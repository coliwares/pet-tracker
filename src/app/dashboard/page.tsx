'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
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
import { Species } from '@/lib/types';
import { SPECIES_OPTIONS } from '@/lib/constants';
import { PawPrint, Plus, Search, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { pets, loading: petsLoading } = usePets();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dismissStep, isDismissed, showStep } = useOnboardingState(user?.id);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | Species>('all');

  const firstPetStepId = 'dashboard-first-pet';
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

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

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch = normalizedSearch.length === 0
        ? true
        : pet.name.toLowerCase().includes(normalizedSearch);
      const matchesSpecies = speciesFilter === 'all' ? true : pet.species === speciesFilter;

      return matchesSearch && matchesSpecies;
    });
  }, [normalizedSearch, pets, speciesFilter]);

  const hasActiveFilters = normalizedSearch.length > 0 || speciesFilter !== 'all';

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
                { label: 'Registra su primer evento médico' },
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

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
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
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/new-pet">
              <Button size="lg" className="shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Nueva Mascota
              </Button>
            </Link>
          </div>
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
                description="Agrega tu primera mascota para empezar a gestionar su historial médico, vacunas y visitas veterinarias"
                actionLabel="Agregar mi primera mascota"
                onAction={() => router.push('/dashboard/new-pet')}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Buscar mascota
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Busca por nombre"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="lg:w-64">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Filtrar por especie
                  </label>
                  <select
                    value={speciesFilter}
                    onChange={(event) => setSpeciesFilter(event.target.value as 'all' | Species)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-sky-300"
                  >
                    <option value="all">Todas las especies</option>
                    {SPECIES_OPTIONS.map((speciesOption) => (
                      <option key={speciesOption.value} value={speciesOption.value}>
                        {speciesOption.pluralLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <div className="rounded-full bg-sky-50 px-3 py-1.5 font-semibold text-sky-800">
                  {filteredPets.length} {filteredPets.length === 1 ? 'resultado' : 'resultados'}
                </div>
                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setSearch('');
                      setSpeciesFilter('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                ) : null}
              </div>
            </section>

            {filteredPets.length > 0 ? (
              <div className="grid animate-fade-in gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/90 p-12 shadow-sm">
                <EmptyState
                  icon={
                    <div className="rounded-3xl bg-slate-100 p-6">
                      <Search className="h-16 w-16 text-slate-400" />
                    </div>
                  }
                  title="No encontramos mascotas"
                  description="Prueba con otro nombre o cambia el filtro de especie para ver más resultados."
                  actionLabel="Limpiar filtros"
                  onAction={() => {
                    setSearch('');
                    setSpeciesFilter('all');
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
