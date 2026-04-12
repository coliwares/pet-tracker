'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/lib/types';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/supabase';

export function useEvents(petId: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents(petId);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (petId) fetchEvents();
  }, [petId]);

  const add = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    const newEvent = await createEvent(event);
    setEvents([newEvent, ...events]);
    return newEvent;
  };

  const update = async (eventId: string, updates: Partial<Event>) => {
    const updated = await updateEvent(eventId, updates);
    setEvents(events.map(e => e.id === eventId ? updated : e));
    return updated;
  };

  const remove = async (eventId: string) => {
    await deleteEvent(eventId);
    setEvents(events.filter(e => e.id !== eventId));
  };

  return { events, loading, error, fetchEvents, add, update, remove };
}
