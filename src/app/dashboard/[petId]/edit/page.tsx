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

  const handleSubmit = async (data: Partial<Pet>, options: PetFormSubmitOptions) => {
    const targetPetId = options.petId ?? petId;
    return updatePet(targetPetId, data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Container className="py-12">
        <Link
          href={`/dashboard/${petId}`}
          className="inline-flex items-center text-base font-semibold text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver a {pet.name}
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
              Editar información de {pet.name}
            </h1>
            <p className="text-gray-600 text-lg">
              Actualiza los datos de tu mascota
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-card border-2 border-gray-100">
            <PetForm
              pet={pet}
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
