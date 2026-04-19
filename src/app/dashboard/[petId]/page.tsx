'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { differenceInCalendarDays } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { Event, Pet } from '@/lib/types';
import { deletePet, getPet } from '@/lib/supabase';
import { calculateAge, formatDate, parseLocalDate } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Timeline } from '@/components/event/Timeline';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit,
  HeartPulse,
  Plus,
  QrCode,
  Scale,
  ShieldCheck,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PetPhoto } from '@/components/pet/PetPhoto';

function sortByEventDateDesc(events: Event[]) {
  return [...events].sort(
    (a, b) => parseLocalDate(b.event_date).getTime() - parseLocalDate(a.event_date).getTime()
  );
}

function isVaccineEvent(event: Event) {
  return event.type === 'vacuna' && event.title.toLowerCase().includes('vacuna');
}

function getUpcomingVaccine(events: Event[]) {
  const today = new Date();

  return [...events]
    .filter((event) => isVaccineEvent(event) && event.next_due_date)
    .sort(
      (a, b) =>
        parseLocalDate(a.next_due_date as string).getTime() -
        parseLocalDate(b.next_due_date as string).getTime()
    )
    .find((event) => parseLocalDate(event.next_due_date as string) >= today);
}

function getLastVisit(events: Event[]) {
  return sortByEventDateDesc(events).find((event) => event.type === 'visita') ?? null;
}

function getStatus(events: Event[], nextDueDate: string | null) {
  const overdueEvents = events.filter((event) => {
    if (!event.next_due_date) {
      return false;
    }

    return differenceInCalendarDays(parseLocalDate(event.next_due_date), new Date()) < 0;
  });

  if (overdueEvents.length > 0) {
    return {
      label: 'Eventos atrasados',
      detail: `${overdueEvents.length} ${overdueEvents.length === 1 ? 'evento atrasado' : 'eventos atrasados'}`,
      tone: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-700',
    };
  }

  if (!nextDueDate) {
    return {
      label: 'Sin próximos recordatorios',
      detail: null as string | null,
      tone: 'text-slate-700',
      badge: 'bg-slate-100 text-slate-700',
    };
  }

  const remainingDays = differenceInCalendarDays(parseLocalDate(nextDueDate), new Date());

  if (remainingDays < 0) {
    const overdueDays = Math.abs(remainingDays);

    return {
      label: 'Vencida',
      detail: `Vencida en ${overdueDays} ${overdueDays === 1 ? 'día' : 'días'}`,
      tone: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-700',
    };
  }

  if (remainingDays <= 14) {
    return {
      label: 'Atención pronto',
      detail: null,
      tone: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
    };
  }

  return {
    label: 'Al día',
    detail: null,
    tone: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
  };
}

function getEventHighlight(event: Event) {
  if (event.next_due_date) {
    const remainingDays = differenceInCalendarDays(parseLocalDate(event.next_due_date), new Date());

    if (remainingDays < 0) {
      const overdueDays = Math.abs(remainingDays);
      return `Vencido hace ${overdueDays} ${overdueDays === 1 ? 'día' : 'días'}`;
    }

    if (remainingDays === 0) {
      return 'Corresponde hoy';
    }

    return `Próximo hito en ${remainingDays} ${remainingDays === 1 ? 'día' : 'días'}`;
  }

  if (event.type === 'visita') {
    return 'Resumen clínico listo para compartir';
  }

  if (event.type === 'medicina') {
    return 'Tratamiento registrado en el historial';
  }

  return 'Historial actualizado';
}

function getEventIcon(event: Event) {
  if (event.type === 'visita') {
    return <Stethoscope className="h-6 w-6" />;
  }

  if (event.type === 'vacuna') {
    return <ShieldCheck className="h-6 w-6" />;
  }

  if (event.type === 'medicina') {
    return <Clock3 className="h-6 w-6" />;
  }

  return <CheckCircle2 className="h-6 w-6" />;
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const petId = params.petId as string;
  const { events, loading: eventsLoading } = useEvents(petId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const data = await getPet(petId);
        setPet(data);
      } catch (err) {
        console.error('Error fetching pet:', err);
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [petId]);

  if (authLoading || loading) {
    return <Loading text="Cargando información..." />;
  }

  if (!user || !pet) {
    return null;
  }

  const age = pet.birth_date ? calculateAge(pet.birth_date) : null;
  const latestVisit = getLastVisit(events);
  const upcomingVaccine = getUpcomingVaccine(events);
  const status = getStatus(events, upcomingVaccine?.next_due_date ?? null);
  const recentHighlights = sortByEventDateDesc(events).slice(0, 3);
  const quickAccessLabel = pet.license_url ? 'Licencia lista' : 'Carnet listo';

  const handleDeletePet = async () => {
    try {
      setDeleting(true);
      await deletePet(petId);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting pet:', err);
      alert('Error al eliminar la mascota');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf9_36%,_#f4f9ff_100%)]">
      <Container className="py-8">
        <Link
          href="/dashboard"
          className="group mb-8 inline-flex items-center text-base font-semibold text-slate-600 transition-colors hover:text-sky-700"
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Volver al dashboard
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(251,146,60,0.16),_transparent_30%)]" />

          <div className="relative">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <PetPhoto
                      name={pet.name}
                      photoUrl={pet.photo_url}
                      sizeClassName="h-24 w-24 rounded-[1.5rem]"
                      imageClassName="object-cover ring-4 ring-sky-100 shadow-lg"
                      fallbackClassName="flex items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg"
                      iconClassName="h-11 w-11 text-white"
                    />

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                        Panel de mascota
                      </p>
                      <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                        {pet.name}
                        {age !== null ? `, ${age} ${age === 1 ? 'año' : 'años'}` : ''}
                      </h1>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800">
                          {pet.species}
                        </span>
                        {pet.breed && (
                          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                            {pet.breed}
                          </span>
                        )}
                        {pet.weight && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                            <Scale className="h-4 w-4" />
                            {pet.weight} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${status.badge}`}>
                    Carnet {status.label.toLowerCase()}
                  </div>
                </div>

                {pet.notes && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm leading-6 text-amber-950">
                    <p className="font-semibold">Notas importantes</p>
                    <p className="mt-1 text-amber-800">{pet.notes}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/dashboard/${petId}/edit`}>
                    <Button variant="secondary" size="md">
                      <Edit className="mr-2 h-5 w-5" />
                      Editar ficha
                    </Button>
                  </Link>
                  <Link href={`/dashboard/${petId}/events/new`}>
                    <Button size="md">
                      <Plus className="mr-2 h-5 w-5" />
                      Agregar evento
                    </Button>
                  </Link>
                  <Button variant="danger" size="md" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 className="mr-2 h-5 w-5" />
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">
                  Acceso rápido
                </p>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black leading-tight">
                      Abre el historial antes de la consulta y comparte lo importante en segundos.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      El carnet concentra vacunas, controles y tratamientos en una sola vista.
                    </p>
                  </div>
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.4rem] bg-white/10 text-sky-100">
                    <QrCode className="h-8 w-8" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                      Estado
                    </p>
                    <p className={`mt-2 text-lg font-bold ${status.tone}`}>{status.label}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                      Documento
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">{quickAccessLabel}</p>
                  </div>
                </div>

                {pet.license_url && (
                  <a
                    href={pet.license_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-200 transition-colors hover:text-white"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Ver licencia municipal
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-500">Último control</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {latestVisit ? formatDate(latestVisit.event_date) : 'Sin registro'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Próxima vacuna</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {upcomingVaccine?.next_due_date ? formatDate(upcomingVaccine.next_due_date) : 'Sin fecha'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Estado</p>
                    <p className={`mt-2 text-2xl font-black ${status.tone}`}>{status.label}</p>
                    {status.detail && (
                      <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-rose-700">
                        {status.detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                    <HeartPulse className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Resumen clínico
                    </p>
                    <p className="text-lg font-bold text-slate-950">
                      {events.length === 0
                        ? 'Aún no hay eventos cargados'
                        : `${events.length} ${events.length === 1 ? 'evento registrado' : 'eventos registrados'}`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Última actualización</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {events[0] ? formatDate(events[0].event_date) : 'Pendiente'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Próximo hito</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {upcomingVaccine ? upcomingVaccine.title : 'Sin recordatorios activos'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {recentHighlights.length > 0 ? (
                recentHighlights.map((event) => (
                  <article
                    key={event.id}
                    className="flex items-start gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-emerald-500">
                      {getEventIcon(event)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-2xl font-bold tracking-tight text-slate-950">{event.title}</p>
                          <p className="mt-1 text-base text-slate-500">{getEventHighlight(event)}</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(event.event_date)}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white/80 px-6 py-8 text-center text-slate-500">
                  Agrega vacunas, controles o tratamientos para empezar a construir el carnet visual de {pet.name}.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="mb-2 text-3xl font-extrabold text-slate-950">Historial médico</h2>
              <p className="text-slate-600">Timeline de vacunas, visitas y tratamientos.</p>
            </div>
            <Link href={`/dashboard/${petId}/events/new`}>
              <Button size="lg" className="shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Agregar evento
              </Button>
            </Link>
          </div>

          {eventsLoading ? <Loading text="Cargando eventos..." /> : <Timeline events={events} />}
        </section>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Eliminar Mascota"
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          onConfirm={handleDeletePet}
          loading={deleting}
        >
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar a <strong>{pet.name}</strong>?
          </p>
          <p className="mt-2 text-gray-600">
            Esta acción eliminará también todos los eventos médicos asociados y no se puede deshacer.
          </p>
        </Modal>
      </Container>
    </div>
  );
}
