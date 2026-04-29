'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { useUserOnboardingProgress } from '@/hooks/useUserOnboardingProgress';
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
import { HeartPulse, PawPrint, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { pets, loading: petsLoading } = usePets();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dismissStep, isDismissed, showStep } = useOnboardingState(user?.id);
  const { petCount, totalEventCount, loading: onboardingLoading } = useUserOnboardingProgress(user?.id, pets);
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | Species>('all');

  const firstPetStepId = 'dashboard-first-pet';
  const firstEventStepId = 'dashboard-first-event';
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
    if (petCount === 0) {
      showStep(firstPetStepId);
    }
  }, [petCount, showStep]);

  useEffect(() => {
    if (petCount > 0 && totalEventCount === 0) {
      showStep(firstEventStepId);
    }
  }, [firstEventStepId, petCount, showStep, totalEventCount]);

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
  const petsWithLicense = useMemo(
    () => pets.filter((pet) => Boolean(pet.license_url)).length,
    [pets]
  );
  const representedSpecies = useMemo(
    () => new Set(pets.map((pet) => pet.species)).size,
    [pets]
  );

  if (authLoading || petsLoading || onboardingLoading) {
    return <Loading text="Cargando mascotas..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf9_36%,_#f4f9ff_100%)]">
      <Container className="py-8">
        {petCount === 0 && !isDismissed(firstPetStepId) ? (
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

        {petCount > 0 && totalEventCount === 0 && !isDismissed(firstEventStepId) ? (
          <div className="mb-4">
            <OnboardingPanel
              badge="Siguiente paso"
              title="Ya tienes mascota. Falta registrar el primer evento."
              description="Carga una vacuna, control o tratamiento para activar el historial real."
              progressLabel="Paso 2 de 3"
              icon={Sparkles}
              accentClassName="text-emerald-700"
              surfaceClassName="border-emerald-200 bg-[linear-gradient(135deg,_#ecfdf5_0%,_#ffffff_100%)]"
              steps={[
                { label: 'Agrega tu primera mascota', completed: true },
                { label: 'Registra su primer evento médico' },
                { label: 'Comparte el carnet cuando lo necesites' },
              ]}
              primaryActionLabel="Abrir primera mascota"
              primaryActionHref={pets[0] ? `/dashboard/${pets[0].id}` : '/dashboard'}
              secondaryActionLabel="Agregar otra mascota"
              secondaryActionHref="/dashboard/new-pet"
              dismissLabel="Saltar"
              onDismiss={() => dismissStep(firstEventStepId)}
            />
          </div>
        ) : null}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(251,146,60,0.16),_transparent_30%)]" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                Panel general
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Mis mascotas
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {pets.length === 0
                  ? 'Comienza agregando tu primera mascota'
                  : 'Revisa fichas, mantén el historial al día y entra rápido al detalle de cada mascota.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/new-pet">
                <Button size="lg" className="shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Agregar mascota
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full bg-sky-100 px-4 py-2 font-semibold text-sky-800">
              {pets.length === 0
                ? 'Sin mascotas registradas'
                : `${pets.length} ${pets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}`}
            </div>
            <div className="rounded-full bg-white/90 px-4 py-2 font-medium text-slate-600">
              Historial y recordatorios en una sola vista
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-white/80 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700">
                  <PawPrint className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Mascotas activas
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{pets.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.35rem] border border-white/80 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Con registro
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{petsWithLicense}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.35rem] border border-white/80 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-700">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Especies
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{representedSpecies}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <UpcomingVaccinesCard />
          <UpcomingVisitsCard />
        </div>

        {pets.length === 0 ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-12 shadow-sm">
              <EmptyState
                icon={
                  <div className="rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 p-6 shadow-xl">
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
          <div className="mt-6 space-y-6">
            <section className="rounded-[1.75rem] border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Buscar y filtrar
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    Encuentra una mascota rápido
                  </h2>
                </div>
                <div className="rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800">
                  {filteredPets.length} {filteredPets.length === 1 ? 'resultado' : 'resultados'}
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Búsqueda instantánea
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Mobile first
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Vista consistente
                </div>
              </div>

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
                <div className="rounded-full bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm">
                  Vista consistente con el detalle individual
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                  {hasActiveFilters ? 'Mostrando filtros activos' : 'Sin filtros aplicados'}
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
              <div className="grid animate-fade-in gap-6 md:grid-cols-2 xl:grid-cols-3">
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
