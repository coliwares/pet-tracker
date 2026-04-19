import Link from 'next/link';
import { CalendarDays, Clock3, ShieldCheck, Stethoscope } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PetPhoto } from '@/components/pet/PetPhoto';
import { getSharedPetByToken } from '@/lib/server/petShare';
import { calculateAge, formatDate, formatDateTime } from '@/lib/utils';
import { Event } from '@/lib/types';

function getEventIcon(event: Event) {
  if (event.type === 'visita') {
    return <Stethoscope className="h-5 w-5" />;
  }

  if (event.type === 'vacuna') {
    return <ShieldCheck className="h-5 w-5" />;
  }

  return <Clock3 className="h-5 w-5" />;
}

export default async function SharedPetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const sharedPet = await getSharedPetByToken(token);

  if (!sharedPet) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf9_36%,_#f4f9ff_100%)]">
        <Container className="py-24">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/80 bg-white/90 p-10 text-center shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-700">
              Enlace no disponible
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Este carnet compartido ya no esta disponible
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              El enlace puede haber expirado o fue revocado por su propietario.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Ir al inicio
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const { pet, events, expiresAt } = sharedPet;
  const age = pet.birth_date ? calculateAge(pet.birth_date) : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#fff8ef_0%,_#fffdf9_36%,_#f4f9ff_100%)]">
      <Container className="py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-6">
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
                      Carnet compartido
                    </p>
                    <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                      {pet.name}
                      {age !== null ? `, ${age} ${age === 1 ? 'ano' : 'anos'}` : ''}
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
                        <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                          {pet.weight} kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {pet.notes && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm leading-6 text-amber-950">
                    <p className="font-semibold">Notas importantes</p>
                    <p className="mt-1 text-amber-800">{pet.notes}</p>
                  </div>
                )}
              </div>

              <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">
                  Informacion del enlace
                </p>
                <p className="mt-4 text-2xl font-black leading-tight">
                  Este acceso es publico y de solo lectura.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Puedes revisar el historial medico sin iniciar sesion mientras el enlace siga activo.
                </p>
                <div className="mt-6 rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                    Caduca
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">{formatDateTime(expiresAt)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white/88 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-950">Historial medico</h2>
              <p className="mt-2 text-slate-600">Vista compartida con vacunas, visitas y tratamientos.</p>
            </div>

            {events.length === 0 ? (
              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white/80 px-6 py-8 text-center text-slate-500">
                No hay eventos registrados para esta mascota.
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-emerald-500">
                        {getEventIcon(event)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xl font-bold tracking-tight text-slate-950">{event.title}</p>
                            {event.description && (
                              <p className="mt-1 text-sm leading-6 text-slate-600">{event.description}</p>
                            )}
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(event.event_date)}
                          </div>
                        </div>

                        {event.next_due_date && (
                          <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                            Proximo recordatorio: {formatDate(event.next_due_date)}
                          </div>
                        )}

                        {event.notes && (
                          <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
