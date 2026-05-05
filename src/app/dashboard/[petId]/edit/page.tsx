'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Pet } from '@/lib/types';
import { getPet, updatePet } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { Loading } from '@/components/ui/Loading';
import { PetForm, PetFormSubmitOptions } from '@/components/pet/PetForm';
import { ArrowLeft } from 'lucide-react';

export default function EditPetPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const petId = params.petId as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

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
      void fetchPet();
    }
  }, [petId]);

  if (authLoading || loading) {
    return <Loading text="Cargando informacion..." />;
  }

  if (!user || !pet) {
    return null;
  }

  const handleSubmit = async (data: Partial<Pet>, options: PetFormSubmitOptions) => {
    const targetPetId = options.petId ?? petId;
    return updatePet(targetPetId, data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Container className="py-12">
        <Link
          href={`/dashboard/${petId}`}
          className="mb-8 inline-flex items-center text-base font-semibold text-gray-600 transition-colors group hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Volver a {pet.name}
        </Link>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center animate-fade-in">
            <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 shadow-xl">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-4xl font-extrabold text-transparent">
              Editar informacion de {pet.name}
            </h1>
            <p className="text-lg text-gray-600">Actualiza los datos de tu mascota</p>
          </div>

          <div className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-card md:p-10">
            <PetForm
              pet={pet}
              userId={user.id}
              onSubmit={handleSubmit}
              onSuccess={(updatedPet) => router.push(`/dashboard/${updatedPet.id}`)}
              submitLabel="Guardar Cambios"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
