'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { Pet } from '@/lib/types';
import { getPet } from '@/lib/supabase';
import { calculateAge } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Timeline } from '@/components/event/Timeline';
import { ArrowLeft, Plus, PawPrint, Edit, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { deletePet } from '@/lib/supabase';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Container className="py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-base font-semibold text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver al dashboard
        </Link>

        {/* Pet Info */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 mb-8 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-start gap-6">
          <div className="flex-shrink-0 space-y-4">
            {/* Foto de mascota */}
            <div>
              {pet.photo_url ? (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className="w-40 h-40 rounded-3xl object-cover ring-4 ring-blue-100 shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-xl">
                  <PawPrint className="w-20 h-20 text-white" />
                </div>
              )}
              <p className="text-xs text-center text-gray-500 mt-2 font-medium">Foto de {pet.name}</p>
            </div>

            {/* Licencia de registro */}
            {pet.license_url && (
              <div>
                <a
                  href={pet.license_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <img
                    src={pet.license_url}
                    alt="Licencia de registro"
                    className="w-40 h-40 rounded-3xl object-cover ring-4 ring-purple-100 shadow-xl group-hover:ring-purple-300 transition-all"
                  />
                  <p className="text-xs text-center text-purple-700 mt-2 font-semibold group-hover:text-purple-800">
                    📄 Licencia municipal
                  </p>
                </a>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{pet.name}</h1>
            <div className="space-y-2 text-gray-700">
              <div className="flex flex-wrap gap-3 mb-3">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-200">
                  {pet.species}
                </span>
                {pet.breed && (
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-bold bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-2 border-purple-200">
                    {pet.breed}
                  </span>
                )}
              </div>
              {age !== null && (
                <p className="text-lg">
                  <span className="font-bold">📅 Edad:</span> {age}{' '}
                  {age === 1 ? 'año' : 'años'}
                </p>
              )}
              {pet.weight && (
                <p className="text-lg">
                  <span className="font-bold">⚖️ Peso:</span> {pet.weight} kg
                </p>
              )}
            </div>
            {pet.notes && (
              <div className="mt-5 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
                <p className="text-base text-gray-700 leading-relaxed">
                  <span className="font-bold">💬 Notas:</span> {pet.notes}
                </p>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Link href={`/dashboard/${petId}/edit`}>
                <Button variant="secondary" size="md">
                  <Edit className="h-5 w-5 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button
                variant="danger"
                size="md"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-card">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Historial Médico</h2>
            <p className="text-gray-600">Timeline de eventos y tratamientos</p>
          </div>
          <Link href={`/dashboard/${petId}/events/new`}>
            <Button size="lg" className="shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Agregar Evento
            </Button>
          </Link>
        </div>

        {eventsLoading ? (
          <Loading text="Cargando eventos..." />
        ) : (
          <Timeline events={events} />
        )}
      </div>

      {/* Delete Modal */}
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
        <p className="text-gray-600 mt-2">
          Esta acción eliminará también todos los eventos médicos asociados y no se puede deshacer.
        </p>
      </Modal>
      </Container>
    </div>
  );
}
