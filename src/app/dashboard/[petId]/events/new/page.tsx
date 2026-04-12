'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { Loading } from '@/components/ui/Loading';
import { EventForm } from '@/components/event/EventForm';
import { ArrowLeft } from 'lucide-react';

export default function NewEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const petId = params.petId as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (data: any) => {
    const { data: event, error } = await supabase
      .from('events')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    router.push(`/dashboard/${petId}`);
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
            <div className="inline-flex p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
              Registrar Evento Médico
            </h1>
            <p className="text-gray-600 text-lg">
              Agrega vacunas, visitas al veterinario o tratamientos
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-card border-2 border-gray-100">
            <EventForm petId={petId} onSubmit={handleSubmit} submitLabel="Crear Evento" />
          </div>
        </div>
      </Container>
    </div>
  );
}
