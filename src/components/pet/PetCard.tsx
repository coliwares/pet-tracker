import Link from 'next/link';
import { Pet } from '@/lib/types';
import { formatPetAge, getPetLifeStage, getSpeciesOption } from '@/lib/utils';
import { PetPhoto } from '@/components/pet/PetPhoto';
import { ArrowUpRight, Scale } from 'lucide-react';

interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  const age = formatPetAge(pet.birth_date);
  const lifeStage = getPetLifeStage(pet.birth_date, pet.species);
  const speciesLabel = getSpeciesOption(pet.species)?.label ?? pet.species;

  return (
    <Link href={`/dashboard/${pet.id}`} className="group block h-full">
      <article className="flex h-full flex-col rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <PetPhoto
              name={pet.name}
              photoUrl={pet.photo_url}
              sizeClassName="h-24 w-24 rounded-[1.5rem]"
              imageClassName="object-cover ring-4 ring-sky-100 shadow-lg transition-all group-hover:ring-sky-200"
              fallbackClassName="flex items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg"
              iconClassName="h-12 w-12 text-white"
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Panel de mascota
              </p>
              <h3 className="mt-2 truncate text-2xl font-black tracking-tight text-slate-950 transition-colors group-hover:text-sky-700">
                {pet.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-600">
                {speciesLabel}
              </p>
            </div>
          </div>

          {lifeStage ? (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${lifeStage.className}`}
            >
              {lifeStage.label}
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800">
            {speciesLabel}
          </span>
          {pet.breed ? (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {pet.breed}
            </span>
          ) : null}
          {age ? (
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {age}
            </span>
          ) : null}
          {pet.weight ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              <Scale className="h-4 w-4" />
              {pet.weight} kg
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
            <span>Ver ficha e historial</span>
            <ArrowUpRight className="h-4 w-4 text-sky-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}
