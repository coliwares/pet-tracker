'use client';

import { useCallback, useEffect, useState } from 'react';
import { Event } from '@/lib/types';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/supabase';

export function useEvents(petId: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEvents(petId);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching events');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (petId) {
        void fetchEvents();
        return;
      }

      setEvents([]);
      setError(null);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchEvents, petId]);

  const add = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    const newEvent = await createEvent(event);
    setEvents((current) => [newEvent, ...current]);
    return newEvent;
  };

  const update = async (eventId: string, updates: Partial<Event>) => {
    const updated = await updateEvent(eventId, updates);
    setEvents((current) => current.map((event) => (event.id === eventId ? updated : event)));
    return updated;
  };

  const remove = async (eventId: string) => {
    await deleteEvent(eventId);
    setEvents((current) => current.filter((event) => event.id !== eventId));
  };

  return { events, loading, error, fetchEvents, add, update, remove };
}
