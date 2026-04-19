'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePets } from '@/hooks/usePets';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { PetCard } from '@/components/pet/PetCard';
import { UpcomingVaccinesCard } from '@/components/home/UpcomingVaccinesCard';
import { UpcomingVisitsCard } from '@/components/home/UpcomingVisitsCard';
import { Plus, PawPrint } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { pets, loading: petsLoading } = usePets();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || petsLoading) {
    return <Loading text="Cargando mascotas..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Container className="py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Mis Mascotas
            </h1>
            <p className="text-gray-600 text-lg">
              {pets.length === 0 ? 'Comienza agregando tu primera mascota' : `${pets.length} ${pets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}`}
            </p>
          </div>
          <Link href="/dashboard/new-pet">
            <Button size="lg" className="shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Nueva Mascota
            </Button>
          </Link>
        </div>

        <UpcomingVaccinesCard />
        <UpcomingVisitsCard />

        {pets.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-card p-12 border-2 border-gray-100">
            <EmptyState
              icon={
                <div className="p-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl shadow-xl">
                  <PawPrint className="h-20 w-20 text-white" />
                </div>
              }
              title="No tienes mascotas registradas"
              description="Agrega tu primera mascota para empezar a gestionar su historial médico, vacunas y visitas veterinarias"
              actionLabel="✨ Agregar mi primera mascota"
              onAction={() => router.push('/dashboard/new-pet')}
            />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
