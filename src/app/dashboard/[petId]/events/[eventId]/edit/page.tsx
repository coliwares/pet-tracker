'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/lib/types';
import { supabase, updateEvent } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { Loading } from '@/components/ui/Loading';
import { EventForm, EventFormSubmitOptions } from '@/components/event/EventForm';
import { ArrowLeft } from 'lucide-react';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const petId = params.petId as string;
  const eventId = params.eventId as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (authLoading || loading) {
    return <Loading text="Cargando evento..." />;
  }

  if (!user || !event) {
    return null;
  }

  const handleSubmit = async (data: Partial<Event>, options: EventFormSubmitOptions) => {
    const updatedEvent = await updateEvent(options.eventId as string, data);
    return updatedEvent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Container className="py-12">
        <Link
          href={`/dashboard/${petId}`}
          className="inline-flex items-center text-base font-semibold text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver al historial
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Editar Evento Médico
            </h1>
            <p className="text-gray-600 text-lg">
              Actualiza la información de este registro
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-card border-2 border-gray-100">
            <EventForm
              petId={petId}
              userId={user.id}
              event={event}
              onSubmit={handleSubmit}
              onSuccess={() => router.push(`/dashboard/${petId}`)}
              submitLabel="Guardar Cambios"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
