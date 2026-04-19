'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createPet, updatePet } from '@/lib/supabase';
import { Pet } from '@/lib/types';
import { Container } from '@/components/ui/Container';
import { Loading } from '@/components/ui/Loading';
import { PetForm, PetFormSubmitOptions } from '@/components/pet/PetForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  const handleSubmit = async (data: Partial<Pet>, options: PetFormSubmitOptions) => {
    if (options.mode === 'create') {
      return createPet({
        name: data.name ?? '',
        species: data.species ?? 'Perro',
        breed: data.breed ?? null,
        birth_date: data.birth_date ?? null,
        weight: data.weight ?? null,
        photo_url: data.photo_url ?? null,
        license_url: data.license_url ?? null,
        notes: data.notes ?? null,
        user_id: user.id,
        is_active: true,
      });
    }

    if (!options.petId) {
      throw new Error('No se encontró la mascota para actualizar');
    }

    return updatePet(options.petId, data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Container className="py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-base font-semibold text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver al dashboard
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Agregar Nueva Mascota
            </h1>
            <p className="text-gray-600 text-lg">
              Completa la información de tu mascota para empezar a gestionar su historial médico
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-card border-2 border-gray-100">
            <PetForm
              onSubmit={handleSubmit}
              onSuccess={(pet) => router.push(`/dashboard/${pet.id}`)}
              submitLabel="Crear Mascota"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
