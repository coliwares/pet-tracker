import Link from 'next/link';
import { Pet } from '@/lib/types';
import { calculateAge } from '@/lib/utils';
import { PawPrint } from 'lucide-react';

interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  const age = pet.birth_date ? calculateAge(pet.birth_date) : null;

  return (
    <Link href={`/dashboard/${pet.id}`}>
      <div className="group bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-blue-200 hover:shadow-card-hover transition-all duration-300 cursor-pointer transform hover:scale-105">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <PawPrint className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {pet.name}
            </h3>
            <p className="text-base text-gray-600 font-medium mt-1">
              {pet.species} {pet.breed && `• ${pet.breed}`}
            </p>
            <div className="flex gap-3 mt-3">
              {age !== null && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                  {age} {age === 1 ? 'año' : 'años'}
                </span>
              )}
              {pet.weight && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
                  {pet.weight} kg
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
