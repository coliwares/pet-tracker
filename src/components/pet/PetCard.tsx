import Link from 'next/link';
import { Pet } from '@/lib/types';
import { formatPetAge, getPetLifeStage } from '@/lib/utils';
import { PetPhoto } from '@/components/pet/PetPhoto';

interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  const age = formatPetAge(pet.birth_date);
  const lifeStage = getPetLifeStage(pet.birth_date, pet.species);

  return (
    <Link href={`/dashboard/${pet.id}`}>
      <div className="group cursor-pointer rounded-2xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:scale-105 hover:border-blue-200 hover:shadow-card-hover">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <PetPhoto
              name={pet.name}
              photoUrl={pet.photo_url}
              sizeClassName="h-24 w-24 rounded-2xl"
              imageClassName="object-cover ring-4 ring-blue-50 transition-all group-hover:ring-blue-100"
              fallbackClassName="flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg transition-shadow group-hover:shadow-xl"
              iconClassName="h-12 w-12 text-white"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <h3 className="min-w-0 flex-1 truncate text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                {pet.name}
              </h3>
              {lifeStage ? (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${lifeStage.className}`}
                >
                  {lifeStage.label}
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-base font-medium text-gray-600">
              {pet.species} {pet.breed ? `- ${pet.breed}` : ''}
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              {age !== null ? (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {age}
                </span>
              ) : null}
              {pet.weight ? (
                <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                  {pet.weight} kg
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
