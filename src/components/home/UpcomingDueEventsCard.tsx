'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { getCurrentUser, getPets, supabase } from '@/lib/supabase';
import { EventType } from '@/lib/types';
import { formatDate, getEventHistoryGroup, parseLocalDate } from '@/lib/utils';

type UpcomingEventRow = {
  id: string;
  pet_id: string;
  title: string;
  event_date: string;
  next_due_date: string;
  petName: string;
};

interface UpcomingDueEventsCardProps {
  type: EventType;
  title: string;
  singularLabel: string;
  pluralLabel: string;
  description: string;
  badgeLabel: string;
  theme: {
    sectionBorder: string;
    sectionBg: string;
    sectionShadow: string;
    badgeBg: string;
    badgeText: string;
    normalPill: string;
    normalIcon: string;
  };
  icon: LucideIcon;
}

export function UpcomingDueEventsCard({
  type,
  title,
  singularLabel,
  pluralLabel,
  description,
  badgeLabel,
  theme,
  icon: Icon,
}: UpcomingDueEventsCardProps) {
  const [events, setEvents] = useState<UpcomingEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchUpcomingEvents = async () => {
      try {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 7);

        const { data, error } = await supabase
          .from('events')
          .select('id, pet_id, title, event_date, next_due_date')
          .eq('type', type)
          .not('next_due_date', 'is', null)
          .order('event_date', { ascending: false })
          .order('next_due_date', { ascending: true });

        if (error) {
          throw error;
        }

        if (!active) {
          return;
        }

        const baseEvents = (data ?? []) as Array<{
          id: string;
          pet_id: string;
          title: string;
          event_date: string;
          next_due_date: string;
        }>;

        const activeEventsByGroup = new Map<string, UpcomingEventRow>();

        for (const event of baseEvents) {
          const eventGroupKey = `${event.pet_id}:${getEventHistoryGroup(event.title)}`;

          if (!activeEventsByGroup.has(eventGroupKey)) {
            activeEventsByGroup.set(eventGroupKey, {
              ...event,
              petName: 'Mascota',
            });
          }
        }

        const filteredEvents = Array.from(activeEventsByGroup.values()).filter((event) => {
          return parseLocalDate(event.next_due_date) <= endDate;
        });

        const petIds = Array.from(new Set(filteredEvents.map((event) => event.pet_id)));

        let petNamesById = new Map<string, string>();

        if (petIds.length > 0) {
          try {
            const user = await getCurrentUser();

            if (user) {
              const petsData = await getPets(user.id);

              petNamesById = new Map(
                (petsData ?? [])
                  .filter((pet) => petIds.includes(pet.id))
                  .map((pet) => [pet.id, pet.name])
              );
            }
          } catch (petsError) {
            console.error(`Error resolving pet names for ${type} events:`, petsError);
          }
        }

        setEvents(
          filteredEvents.map((event) => ({
            ...event,
            petName: petNamesById.get(event.pet_id) ?? 'Mascota',
          }))
            .sort(
              (a, b) =>
                parseLocalDate(a.next_due_date).getTime() - parseLocalDate(b.next_due_date).getTime()
            )
        );
      } catch (error) {
        console.error(`Error fetching upcoming ${type} events:`, error);
        if (active) {
          setEvents([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchUpcomingEvents();

    return () => {
      active = false;
    };
  }, [type]);

  if (loading || events.length === 0) {
    return null;
  }

  return (
    <section className={`mb-8 rounded-[1.75rem] border p-6 ${theme.sectionBorder} ${theme.sectionBg} ${theme.sectionShadow}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${theme.badgeBg} ${theme.badgeText}`}>
            <AlertCircle className="h-4 w-4" />
            {badgeLabel}
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
            {title}: {events.length} {events.length === 1 ? singularLabel : pluralLabel} en los próximos 7 días
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-600">
            {description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[18rem] lg:max-w-sm">
          <div className="rounded-[1.35rem] border border-white/80 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Próximos 7 días
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">{events.length}</p>
            <p className="mt-1 text-sm text-slate-500">
              {events.length === 1 ? singularLabel : pluralLabel}
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-white/80 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Vista rápida
            </p>
            <p className="mt-2 text-lg font-black text-slate-950">
              {events[0]?.petName ?? 'Mascota'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {events[0] ? formatDate(events[0].next_due_date) : 'Sin fecha'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {events.map((event) => {
          const dueDate = parseLocalDate(event.next_due_date);
          const today = new Date();
          const diffInDays = Math.ceil(
            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          const isOverdue = diffInDays < 0;
          const statusLabel =
            diffInDays === 0
              ? 'Hoy'
              : diffInDays === 1
                ? 'Mañana'
                : isOverdue
                  ? `${Math.abs(diffInDays)} días tarde`
                  : `${diffInDays} días`;
          const statusPillClass = isOverdue
            ? 'bg-red-50 text-red-700'
            : theme.normalPill;
          const cardClass = isOverdue
            ? 'border-red-200 bg-[linear-gradient(135deg,_#fff1f2_0%,_#ffffff_100%)]'
            : 'border-white bg-white';
          const iconClass = isOverdue
            ? 'bg-red-100 text-red-700'
            : theme.normalIcon;
          const dateBoxClass = isOverdue ? 'bg-red-50' : 'bg-slate-50';

          return (
            <div
              key={event.id}
              className={`rounded-[1.5rem] border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${cardClass}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-2xl p-3 ${iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Seguimiento activo
                    </p>
                    <p className="text-lg font-bold text-slate-950">{event.petName}</p>
                    <p className="truncate text-sm text-slate-500">{event.title}</p>
                  </div>
                </div>

                <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${statusPillClass}`}>
                  {statusLabel}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  Registrado el {formatDate(event.event_date)}
                </div>
                <div className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  Recordatorio activo
                </div>
              </div>

              <div className={`mt-4 flex items-center justify-between gap-4 rounded-2xl px-4 py-3 ${dateBoxClass}`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {isOverdue ? 'Fecha vencida' : 'Fecha programada'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDate(event.next_due_date)}
                  </p>
                </div>

                <Link href={`/dashboard/${event.pet_id}`}>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                    Abrir ficha
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
